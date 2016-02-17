# Markdown

Zotermite-flavoured markdown (ZFM) is based upon github-flavoured markdown.

If you are not familiar with markdown, please check first [this documentation]( https://help.github.com/articles/basic-writing-and-formatting-syntax/) about the markdown language and its faculties.

# Zotermite tags

Zotermite works with a system of tags.
Tags allow you to populate your template with zotero-based values.

In ZFM, there are four types of tags :
* $set$ : value substitution
* $if$ : positive conditional
* $ifnot$ : negative conditionnal
* $loop$ : recursivity

# $set$ and implicit set

This first tag allows you to replace some parts of your template with values coming from zotero about the selected items.

Let's say we want to get the title of our bibliographical record entitled "Alice in wonderland" :

If we write in our template description :

```
title : $set:title$
```

We will get in our output content :
```
title : Alice in Wonderland
```

Similarly, if you don't preceed your value key (here : "title") by the set statement, the tag will be considered as an implicit set statement. Thus:

```
Writing :

$set:title$

is the same as writing :

$title$

```

Todo : explain arrays access and properties access.

Todo : add (and then explain) the following modificators : getYear and getInitials.

# $if$ and $endif$

Conditionals allow you to display some parts of your template only if a specific value is available.

Example :

```
$if:title$
Title : $title$
$endif:title$
```

You will note that the endif statement also features ":title" in order to be recognized.

Todo : implement and explain array length related ifs, and equality statements ifs

# $ifnot$ and $endifnot$

Negative conditionals : display only if the condition is not fullfilled.

```
$ifnot:title$
No title
$endifnot:title$
```

# $loop$ and $endloop$

```
$loop:author in creators$
$author.lastName$
$endloop:author in creators$
```

Todo : explain separator and terminator
