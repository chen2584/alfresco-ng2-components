# Node Restore directive

Restores deleted nodes to their original location.

## Basic Usage

```html
<adf-toolbar title="toolbar example">
    <button mat-icon-button
        location="/files"
        [adf-restore]="documentList.selection"
        (restore)="documentList.reload()">
        <mat-icon>restore</mat-icon>
    </button>
</adf-toolbar>

<adf-document-list #documentList
    currentFolderId="-trash-" ...>
    ...
</adf-document-list>
```

### Properties

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| adf-restore | DeletedNodeEntry\[] | \[] | Deleted nodes to restore |
| location | string | '' | Route path to view restored node |

### Events

| Name | Description |
| ---- | ----------- |
| restore | Raised when the restore is done |

## Details

'NodeRestoreDirective' directive takes a selection of `DeletedNodeEntry[]` and restores them in their original location.
If the original location doesn't exist anymore, then they remain in the trash list.

For single node restore, there is action to jump to the location where the node has been restored and for this `location` is used to specify the route path where the list of nodes are rendered

## See Also

-   [Node delete directive](node-delete.directive.md)
