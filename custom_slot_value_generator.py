import nltk

#nltk.download('words')
nltk.download('cess_esp')
#nltk.download('brown')

import nltk.corpus
from nltk.probability import FreqDist

import json, random, string

def get_random_words(n, corpus):
  words_freqs = FreqDist(nltk.corpus.cess_esp.words()).most_common(n)
  corpus_words = [wf[0] for wf in words_freqs]
  words = [w for w in corpus_words if w.isalpha()]
  return random.sample(words, len(words))

words_list = [word.lower() for word in get_random_words(1000, 'cess_esp')]

words_list = list(set(words_list))

word_pairs = []
for word in words_list:
    pair = ' '.join(random.sample(words_list, 2))
    word_pairs.append(pair)

word_pairs = list(set(word_pairs))

print('\n'.join(word_pairs))