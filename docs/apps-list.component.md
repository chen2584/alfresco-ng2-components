# Apps List Component

Shows all available apps.

![how-filter-apps](docassets/images/how-filter-apps.png)

## Basic Usage

```html
<adf-apps 
    [layoutType]="'GRID'">
</adf-apps>
```

### Properties

| Name | Type | Description |
| ---- | ---- | ----------- |
| layoutType | `string` | (\*\*required\*\*) Defines the layout of the apps. There are two possible values, "GRID" and "LIST".<br/> Default value: `AppsListComponent.LAYOUT_GRID` |
| filtersAppId | `any[]` | Provides a way to filter the apps to show.  |

### Events

| Name | Type | Description |
| ---- | ---- | ----------- |
| appClick | `EventEmitter<AppDefinitionRepresentationModel>` | Emitted when an app entry is clicked. |
| error | `EventEmitter<any>` | Emitted when an error occurs. |

## Details

### How filter the activiti apps

If you want to show some specific apps you can specify them through the filtersAppId parameters

```html
<adf-apps 
    [filtersAppId]="'[
        {defaultAppId: 'tasks'}, 
        {deploymentId: '15037'}, 
        {name : 'my app name'}]'">
</adf-apps>
```

In this specific case only the Tasks app, the app with deploymentId 15037 and the app with "my app name" will be shown.

![how-filter-apps](docassets/images/how-filter-apps.png)

You can use inside the filter one of the following property 

```json
{ 
    "defaultAppId": "string", 
    "deploymentId": "string", 
    "name": "string", 
    "id": "number", 
    "modelId": "number",
    "tenantId": "number"
}
```
