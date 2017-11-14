from bs4 import BeautifulSoup
from dateutil.parser import parse as parse_date
import json
from itertools import chain


def parse_claim(c):
    def get_topic():
        t = c.find('div', class_='details not-expanded')
        if not t:
            t = c.find('div', class_='details expanded')
        return t.find('p').text.split(': ')[-1]

    date = parse_date(c.find('div', class_='dateline').text)
    date = (date.day, date.month)

    return {
        'date': date,
        'text': c.find('div', class_='claim').text,
        'analysis': c.find('div', class_='analysis').text,
        'topic': get_topic()
    }


def to_hash_collisions(ls, field):
    res = {}
    for el in ls:
        key = el[field]
        if key in res:
            res[key].append(el)
        else:
            res[key] = [el]
    return res


def most_similar(ls, orig):
    ls = map(lambda text: set(text.split(' ')), ls)
    orig = set(orig.split(' '))
    closest_idx = -1
    closest_dst = -1
    for idx, bag in enumerate(ls):
        score = len(list(filter(lambda word: word in orig, bag)))
        if score > closest_dst:
            closest_dst = score
            closest_idx = idx
    return closest_idx


if __name__ == '__main__':
    # Parse list of debunked tweets
    soup = BeautifulSoup(open('fake_tweets.html'), 'html.parser')

    claims_list = soup.find(id='claims-list')\
                      .findAll('div', class_='claim-row')

    claims = map(parse_claim, claims_list)

    # Build a hash map indexed on (day,month) with collision lists
    claims = to_hash_collisions(claims, 'date')

    # Read and prepare tweets from 2017
    with open('condensed_2017.json', 'r') as f:
        tweets17 = json.load(f)

    for t in tweets17:
        date = parse_date(t['created_at'])
        date = (date.day, date.month)
        t['created_at'] = date

    # Build a hash map indexed on (day,month) with collision lists
    tweets17 = to_hash_collisions(tweets17, 'created_at')


    # Associate tweet id to each debunked tweet
    for date, debunked_list in claims.items():
        if date not in tweets17:
            print('No tweet for', date)
            continue
        collision_list = tweets17[date]
        for deb in debunked_list:
            corresponding = None
            if len(collision_list) == 1:
                corresponding = collision_list[0]
            else:
                idx = most_similar([o['text'] for o in collision_list], deb['text'])
                corresponding = collision_list[idx]
            deb['tweet_id'] = corresponding['id_str']

    # Convert hashmap with collision lists back to list and sort by date
    claims = sorted(chain.from_iterable(claims.values()), key=lambda o: o['date'])
    claims = list(filter(lambda t: 'tweet_id' in t, claims))

    # Dump everything to a nice json
    with open('fact_checked.json', 'w') as f:
        json.dump(claims, f)

    print(len(claims), 'debunked tweets',  len(set([o['tweet_id'] for o in claims])), 'unique id associated to them :(')

