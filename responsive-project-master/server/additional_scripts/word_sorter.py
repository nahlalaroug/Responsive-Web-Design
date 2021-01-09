import re

regex = r"([0-9];*)"
regex2 = r";"
filename= "../cache/listmot.txt"
content= ""


with open(filename) as f:
    content+= re.sub(regex2,"",re.sub(regex,"",f.read(), 0, re.MULTILINE),0,re.MULTILINE)
words = content.split("\n")
words.sort()

file = open("../cache/words/sorted","w")
for w in words:
    file.write(w + "\n")
