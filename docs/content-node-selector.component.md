# Content Node Selector component

Allows a user to select items from a Content Services repository.

![Content Node Selector screenshot](docassets/images/ContentNodeSelector.png)

## Basic Usage

### Properties

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| title | string | "" | Text shown at the top of the selector |
| currentFolderId | string | null | Node ID of the folder currently listed |
| dropdownHideMyFiles | boolean | false | Hide the "My Files" option added to the site list by default. [See More](sites-dropdown.component.md) |
| dropdownSiteList | [SitePaging](https://github.com/Alfresco/alfresco-js-api/blob/master/src/alfresco-core-rest-api/docs/SitePaging.md) |  | custom site for site dropdown same as siteList. [See More](sites-dropdown.component.md#properties) |
| rowFilter | RowFilter | null | Custom row filter function. [See More](document-list.component.md#custom-row-filter) |
| imageResolver | ImageResolver | null | Custom image resolver function. [See More](document-list.component.md#custom-image-resolver) |
| pageSize | number | 10 | Number of items shown per page in the list |

### Events

| Name | Description |
| ---- | ----------- |
| select | Emitted when the user has selected an item |

## Details

The Content Node Selector component works a lot like the standard File Open/Save
dialog used by desktop applications except that it chooses items from a Content Services
repository rather than the filesystem. For example, the
[Document List component](document-list.component.md) uses a selector to choose the targets
of Copy/Move actions (see the [Content Action component](content-action.component.md) for
more information).

Unlike most components, the Content Node Selector is typically shown in a dialog box
rather than the main page and you are responsible for opening the dialog yourself. You can use the
[Angular Material Dialog](https://material.angular.io/components/dialog/overview) for this,
as shown in the usage example. ADF provides the `ContentNodeSelectorComponentData` interface
to work with the Dialog's
[data option](https://material.angular.io/components/dialog/overview#sharing-data-with-the-dialog-component-):

```ts
interface ContentNodeSelectorComponentData {
    title: string;
    currentFolderId?: string;
    rowFilter?: RowFilter;
    imageResolver?: ImageResolver;
    select: EventEmitter<MinimalNodeEntryEntity[]>;
}
```

If you don't want to manage the dialog yourself then it is easier to use the
[Content Node Selector Panel component](content-node-selector-panel.component.md), or the
methods of the [Content Node Dialog service](content-node-dialog.service.md), which create
the dialog for you.

### Usage example

```ts
import { MatDialog } from '@angular/material';
import { ContentNodeSelectorComponentData, ContentNodeSelectorComponent} from '@adf/content-services'
import { Subject } from 'rxjs/Subject';
 ...

constructor(dialog: MatDialog ... ) {}

openSelectorDialog() {
    data: ContentNodeSelectorComponentData = {
        title: "Choose an item",
        currentFolderId: someFolderId,
        select: new Subject<MinimalNodeEntryEntity[]>()
    };

    this.dialog.open(
        ContentNodeSelectorComponent,
        {
            data, panelClass: 'adf-content-node-selector-dialog',
            width: '630px'
        }
    );

    data.select.subscribe((selections: MinimalNodeEntryEntity[]) => {
        // Use or store selection...
    }, 
    (error)=>{
        //your error handling
    }, 
    ()=>{
        //action called when an action or cancel is clicked on the dialog
        this.dialog.closeAll();
    });
}
```

All the results will be streamed to the select [subject](http://reactivex.io/rxjs/manual/overview.html#subject) present in the `ContentNodeSelectorComponentData` object passed to the dialog.
When the dialog action is selected by clicking, the `data.select` stream will be completed.

### RowFilter and ImageResolver

The Content Node Selector uses a [Document List](document-list.component.md) to display the
items that the user can choose. As with the standard Document List, you can supply a custom
**row filter** function (to hide items that can't be chosen) and a custom **image resolver**
function (to select an image to show in a particular list cell). For example, you could use
a row filter to hide document nodes in a folder selector. See the
[Advanced Usage and Customization](document-list.component.md#advanced-usage-and-customization)
section of the Document List page to learn how these functions are implemented.

## See also

-   [Document list component](document-list.component.md)
-   [Content Node Selector Panel component](content-node-selector-panel.component.md)
-   [Content Node Dialog service](content-node-dialog.service.md)
