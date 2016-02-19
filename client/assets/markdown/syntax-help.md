## Markdown basics

Zotermite-flavoured markdown (ZFM) is based upon github-flavoured markdown.

If you are not familiar with markdown, please check first [this documentation]( https://help.github.com/articles/basic-writing-and-formatting-syntax/) about the markdown language and its faculties.

## Zotermite-flavoured markdown

Zotermite works with a system of tags.
Tags allow you to populate your template with zotero-based values.

In ZFM, there are four types of tags :
* $set$ : value substitution
* $if$ and $endif$ : positive conditional
* $ifnot$ and $endifnot$ : negative conditionnal
* $loop$ and $endloop$ : recursivity

## $set$ and implicit set

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

#### Arrays access

Some Zotero properties, such as creators, pdon't point to a single item but to several ones.

In order to access one of the items in an array property, follow it with the expression [number], when number is the rank of the item you wish to access to (first rank is 0).

Here is an example :

```
$creators[0]$
```

Please not that using loops (see below) prevent you from having to access each item separately, because it loops through all of them.

#### Properties access

Some Zotero properties, such as creators, are complex objects that feature several properties.

For instance, creators feature the following properties :
* creatorType : the type of creator recorded (author, editor, or contributor)
* lastName : her last name
* firstName : her first name

In order to access them, follow the property name with a point (.). 


Here is an example :

```
$author.lastName$
```

You can get a list of the featured property in the "vocabulary" section of the help.

#### Modificators

Template values can be modified through simple operations.

###### uppercase and lowercase

Transforms your value casing to uppercase or lowercase:

```
$title:uppercase$
```

###### initials

Fetch the initial of a value (made for first names of course, but do whatever you want with that):

```
$creators[0].firstName:initials$
```

###### year

Extracts the year for a value (made for item dates of course, but do whatever you want with that):

```
$date:year$
```


## $if$ and $endif$

#### Availability $if$

Conditionals that display some parts of your template only if a specific value is available.

Example :

```
$if:title$
Title : $title$
$endif:title$
```

You will note that the endif statement also features ":title" in order to be recognized.

#### Comparator $if$

Conditionals that test your value against another.

```
$if:type:equals_to_book$
Book title : $title$
$endif:type:equals_to_book$
```


Here is a list of comparators available :

```
equals_to_
superior_to_
inferior_to_
superiorequals_to_
inferiorequals_to_
lengthequals_to_
lengthsuperior_to_
lengthinferior_to_
lengthsuperiorequals_to_
lengthinferiorequals_to_
```

Comparators begining with "length" will test the length of value (works for text and arrays such as list of creators).

Example :

```
$if:creators:lengthequals_to_1$
Single author
$end:creators:lengthequals_to_1$

$if:creators:lengthsuperior_to_1$
Multiple authors
$end:creators:lengthsuperior_to_1$
```

## $ifnot$ and $endifnot$

Negative conditionals : display only if the condition is not fullfilled.

```
$ifnot:title$
No title
$endifnot:title$
```

## $loop$ and $endloop$

Loops allow you to process your template on zotero properties which are lists, as the list of creators. Whatever you write between the $loop$ and the $endloop$ tag will be repeated as much times as the list has items, and will substitute each of them with the name you give them in the loop.

For instance, let's say we want to loop through all the creators of an item :

```
$loop:author in creators$
$author.lastName$
$endloop:author in creators$
```


#### Loop separators and terminators

Additionnally, you can add to your loop some parameters about how to display items whether they are at the end of your list or not. For that purpose, you can add a *separator* and a *terminator* parameter to your $loop$ statement.


For instance, if we want to feature the names of the creators of your record separated by comas and terminated by a point, you'll do the following :

```
$loop:author in creators:separator=,:terminator=.$
$author.lastName$
$endloop:author in creators$
```
