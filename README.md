Zotermite
============
# When Markdown meets Zotero


Zotermite is an open-source app aimed at facilitating the use of academic references in markdown documents.

Does the previous sentence sound like a foreign language to your kind ears ? Well, then first check out [what is Zotero](https://www.zotero.org/) and [what is Markdown](https://help.github.com/articles/about-writing-and-formatting-on-github/).

Zotermite can be used to generate markdown bibliographies, but also reading notes templates (the purpose for which I made it in the first place), and whatever your shiny imagination can produce.

Contributions are welcome, especially for the writing of additional standard templates. Send me a mail or pull-request the github for that !

# Use zotermite : documentation

Check it directly in [the app](https://zotermite.herokuapp.com) or find it at these addresses in this repo :

* [syntax documentation](https://github.com/robindemourat/zotermite/blob/master/client/assets/markdown/syntax-help.md)
* [https://github.com/robindemourat/zotermite/blob/master/server/models/models.json](vocabulary documentation)

# API service

Zotermite also features a mini API Service allowing you to dynamically process zotero items with its templating engine.

Here is the endpoint pattern :
```
POST /api/convert/:inputFormat/:template?
```

``inputFormat`` : the format in which the data will be past. For now, it only supports the value ``zotero``, which correspond to the native json objects served by the zotero API. Later, we could add other input formats, like bibtext for instance.

``template`` : the template to use to populate the response with input data.

The data to pass through your POST request must look like that :

```
{
    items : [array] // an array of the items to process,
    
    template : {string} //optional : if you want to use your own template, don't pass a template parameters and directly input its content as a string through this property
}
```

A successful answer you will get looks like that :

```
{
    template : {string} // the template that have been use to process your data

    items : [{
                item : [object] //the input data
                markdownContent : {string} //the input, populated content
            }]

    joinedContent : {string} //a string featuring all your outputs as one single text
}
```
