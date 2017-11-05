import nltk
from nltk.stem import WordNetLemmatizer
import json
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds
import math


def create_term_document_matrix(terms, documents):
    """
    Constructs a sparse matrix which contains n at r,c if term r is in document c n times
    (rows -> terms, columns -> documents)
    """
    # Inversed index for faster lookup
    terms_inv = {term: index for index, term in enumerate(terms)}

    columns, rows, counts = zip(*[(doc_id, terms_inv[word], doc.count(word))
                                  for doc_id, doc in enumerate(documents)
                                  for word in filter(lambda w: len(w) > 0, doc.split(' '))])

    return csr_matrix((counts, (rows, columns)), shape=(len(terms), len(documents)))


def compute_term_frequency(term_index, doc_index, term_document_mat):
    """
    Computes the term frequency of term in doc using:
    tf(term, doc) = doc.count(term) / max over terms of (doc.count(term))
    """
    doc_col = term_document_mat.getcol(doc_index)
    return doc_col[term_index].toarray()[0, 0] / doc_col.max()


def compute_inverse_document_frequency(term_index, matrix):
    """
    Computes the inverse document frequency of term using:
    idf(term) = log_2(# documents in which term occurs / # documents)
    """
    ni = matrix.getrow(term_index).count_nonzero()
    return -math.log(ni / matrix.shape[1], 2)


def compute_tfidf_matrix(term_document_mat):
    """
    Computes tfidf matrix: each element is tf(term, doc) * idf(term)
    """
    rows, cols = term_document_mat.nonzero()
    tf = lambda t, d: compute_term_frequency(t, d, term_document_mat)
    idf = lambda t: compute_inverse_document_frequency(t, term_document_mat)
    vals = [tf(t, d) * idf(t) for t, d in zip(rows, cols)]
    return csr_matrix((vals, (rows, cols)), shape=term_document_mat.shape)


def get_all_terms(cleaned_tweets):
    """
    Extracts terms from tweets
    """
    all_terms = []
    for tweet in cleaned_tweets:
        for term in tweet.split(' '):
            if len(term) > 0 and term not in all_terms:
                all_terms.append(term)
    return all_terms


class Cleaner:
    def __init__(self, punctuation, stop_words, lemmatizer=None, stemmer=None):
        self._punctuation = set(punctuation)
        self._lemmatizer = lemmatizer
        self._stemmer = stemmer
        self._stop_words = set(stop_words)

    def clean_word(self, word):
        if self._lemmatizer:
            word = self._lemmatizer.lemmatize(word)
        if self._stemmer:
            word = self._stemmer.stem(word)

        return word if word not in self._stop_words else ''

    def clean_tweet(self, tweet):
        char_cleaner = lambda char: char if char not in self._punctuation and char.isalpha() else ' '
        tweet_clean = ''.join(map(char_cleaner, tweet.lower()))
        cleaned_words = map(lambda w: self.clean_word(w), tweet_clean.split(' '))
        long_words = filter(lambda w: len(w) > 1, cleaned_words)
        return ' '.join(long_words)


if __name__ == '__main__':

    punctuation = [',', '.', '-', ':', '\xa0', '%', '_', '!', '?', ';', '(', ')', '\n']
    with open('stopwords.json', 'r') as f:
        stopwords = json.load(f)

    nltk.download('wordnet')

    lemmatizer = WordNetLemmatizer()
    cleaner = Cleaner(punctuation, stopwords, lemmatizer)

    with open('condensed_2009.json', 'r') as f:
        tweets = json.load(f)

    tweets = list(map(lambda t: cleaner.clean_tweet(t['text']), tweets))
    terms = get_all_terms(tweets)
    td = create_term_document_matrix(terms, tweets)
    tfidf = compute_tfidf_matrix(td)
    print(tfidf)

