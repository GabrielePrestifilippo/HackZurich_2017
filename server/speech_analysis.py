import json
from os.path import join, dirname
import watson_developer_cloud
from watson_developer_cloud import SpeechToTextV1
import watson_developer_cloud.natural_language_understanding.features.v1 as features
import pandas as pd
import nltk
from nltk.corpus import wordnet as wn
import pickle


class SpeechAnalysis:
    """
    Class for analysing the user voice input
    """

    def __init__(self):
        pass

    @staticmethod
    def speech_to_text(usr, password):
        try:
            return SpeechToTextV1(username=usr, password=password,  x_watson_learning_opt_out=False)
        except:
            return []

    @staticmethod
    def nlp_parse(usr, password):
        try:
            return watson_developer_cloud.NaturalLanguageUnderstandingV1(version='2017-02-27',
                                                              username=usr,
                                                              password=password)
        except:
            return []

    @staticmethod
    def parse_foods(path, format='mp3'):
        """
        Parses the audio file & returns the foods that are contained in the speech
        :param path: path to the audio file
        :return: the list of foods
        """
        with open(path, 'rb') as audio:
            txt = json.dumps(SpeechAnalysis.speech_to_text('6d736cd4-1e01-4d6c-9c61-78ce7f803024', 'SBE03B3o5PTP').recognize(
                audio, content_type='audio/'+format, timestamps=True,
                word_confidence=True),
                indent=2)
                
            

            json_text = json.loads(txt)
            text = json_text['results'][0]['alternatives'][0]['transcript']
            keywords = SpeechAnalysis.nlp_parse('991ee8cd-25f9-4b5a-a1f8-cfe5834dfcb9', 'Jtera8xCDVup').analyze(text=text, features=[features.Keywords()])
            s = pd.Series(keywords)


            keyword_list = []
            for k in s.keywords:
                keyword_list.append(k['text'])
        
            #food = wn.synset('food.n.02')
            food = pickle.load(open("./nltk_food2.p", "rb"))
            
            foods = [k for k in keyword_list if k in food]
            return json.dumps(foods)

    @staticmethod
    def nutrition_df(foods):
        """
        Provides the nutritions of the given food/foods
        :param foods: list of foods
        :return: dataframe containing the nutrition info for the desired foods
        """
        usda = pd.read_csv('./data/usda_sample-2015.csv')
        usda = usda.drop(['brand_name', 'brand_id',
                          'item_id', 'upc', 'item_description', 'item_type', 'nf_ingredient_statement', 'updated_at'],
                         axis=1)
        matched_food = []
        for f in foods:
            for index, row in usda.iterrows():
                if f in row['item_name']:
                    matched_food.append(index)
                    # returns the first occurance of the food, e.g. chicken
                    break

        selected_nutrition_df = usda.iloc[matched_food, :]
        return selected_nutrition_df

    @staticmethod
    def nutrition_balance_df(df):
        """
        Given a nutrition dataframe, returns the carbonhydade, fat, protein amounts
        :param df: input df
        :return: filtered df

        e.g.
                                                           item_name  nf_total_fat  \
        0  Veal, variety meats and by-products, tongue, c...             8
        1             Babyfood, cereal, barley, dry - 0.5 oz             0
        2  Broadbeans (fava beans), mature seeds, raw - 1...             2
        3  Beef, chuck eye steak, boneless, separable lea...            62
        4  Cheese, cottage, creamed, large or small curd ...             9

        """
        pcf = df[['item_name','nf_total_fat','nf_total_carbohydrate','nf_protein']]
        pcf['total'] = pcf['nf_total_fat'] + pcf['nf_total_carbohydrate'] + pcf['nf_protein']
        pcf['fat_pct'] = pcf.nf_total_fat / pcf.total
        pcf['protein_pct'] = pcf.nf_protein / pcf.total
        pcf['carbon_pct'] = pcf.nf_total_carbohydrate / pcf.total
        pcf = pcf.round({'fat_pct': 2, 'protein_pct': 2, 'carbon_pct': 2})
        pcf = pcf.fillna(0)
        return pcf

    @staticmethod
    def recommend(user_history, items):
        """
        Recommends food by balancing the daily nutritian ratio
        :param user_history: past consumption of the user
        :param items: the candidate items
        :return: top 5 recommended items in a dataframe
        """
        ranked_recommendations = pd.DataFrame(columns=['name', 'score'])

        for index, row in items.iterrows():
            total = user_history.total + row.total
            score = 0
            score = (score + 0.5 * total - (user_history.nf_total_carbohydrate + row.nf_total_carbohydrate)) ** 2
            score = (score + 0.2 * total - (user_history.nf_protein + row.nf_protein)) ** 2
            score = (score + 0.3 * total - (user_history.nf_total_fat + row.nf_total_fat)) ** 2

            score = score ** 0.5

            df_dummy = pd.Series()
            df_dummy['name'] = row['item_name']
            df_dummy['score'] = score

            df_dummy['score'] = df_dummy['score'].convert_objects(convert_numeric=True)

            ranked_recommendations = ranked_recommendations.append(df_dummy, ignore_index=True)

        #ranked_recommendations = ranked_recommendations.nsmallest(5, 'score')#pandas dataframe 2.7
        return ranked_recommendations

# Example usage
# s = SpeechAnalysis()
# foods = s.parse_foods('./chicken_dinner.mp3')
# print(foods)
# print(s.nutrition_df(foods))
