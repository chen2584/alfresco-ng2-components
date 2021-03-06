# Comments Component

Displays comments from users involved in a specified task and allows an involved user to add a comment to the task.

![adf-comments](docassets/images/adf-comments.png)

## Basic Usage

```html
<adf-comments
    [taskId]="YOUR_TASK_ID"
    [readOnly]="YOUR_READ_ONLY_FLAG">
</adf-comments>
```

### Properties

| Name | Type | Description |
| ---- | ---- | ----------- |
| taskId | `string` | The numeric ID of the task.  |
| readOnly | `boolean` | Are the comments read only? <br/> Default value: `false` |

### Events

| Name | Type | Description |
| ---- | ---- | ----------- |
| error | `EventEmitter<any>` | Emitted when an error occurs while displaying/adding a comment. |
