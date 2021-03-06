/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { DataColumn, DataRowEvent, DataSorting, DataTableAdapter, ObjectDataColumn, ObjectDataRow, ObjectDataTableAdapter } from '@alfresco/adf-core';
import { AppConfigService, DataColumnListComponent } from '@alfresco/adf-core';
import { DatePipe } from '@angular/common';
import { AfterContentInit, Component, ContentChild, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ProcessFilterParamRepresentationModel } from '../models/filter-process.model';
import { ProcessInstance } from '../models/process-instance.model';
import { processPresetsDefaultModel } from '../models/process-preset.model';
import { ProcessService } from '../services/process.service';

@Component({
    selector: 'adf-process-instance-list',
    styleUrls: ['./process-list.component.css'],
    templateUrl: './process-list.component.html'
})
export class ProcessInstanceListComponent implements OnChanges, AfterContentInit {

    @ContentChild(DataColumnListComponent) columnList: DataColumnListComponent;

    @Input()
    appId: number;

    @Input()
    processDefinitionKey: string;

    @Input()
    state: string;

    @Input()
    sort: string;

    @Input()
    name: string;

    @Input()
    presetColumn: string;

    requestNode: ProcessFilterParamRepresentationModel;

    @Input()
    data: DataTableAdapter;

    @Output()
    rowClick: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    success: EventEmitter<ProcessInstance[]> = new EventEmitter<ProcessInstance[]>();

    @Output()
    error: EventEmitter<any> = new EventEmitter<any>();

    currentInstanceId: string;
    isLoading: boolean = true;
    layoutPresets = {};

    constructor(private processService: ProcessService,
                private appConfig: AppConfigService) {
    }

    ngAfterContentInit() {
        this.loadLayoutPresets();
        this.setupSchema();

        if (this.appId) {
            this.reload();
        }
    }

    /**
     * Setup html-based (html definitions) or code behind (data adapter) schema.
     * If component is assigned with an empty data adater the default schema settings applied.
     */
    setupSchema() {
        let schema: DataColumn[] = [];

        if (this.columnList && this.columnList.columns && this.columnList.columns.length > 0) {
            schema = this.columnList.columns.map(c => <DataColumn> c);
        }

        if (!this.data) {
            this.data = new ObjectDataTableAdapter([], schema.length > 0 ? schema : this.getLayoutPreset(this.presetColumn));
        } else {
            if (schema && schema.length > 0) {
                this.data.setColumns(schema);
            } else if (this.data.getColumns().length === 0) {
                this.presetColumn ? this.setupDefaultColumns(this.presetColumn) : this.setupDefaultColumns();
            }
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.isPropertyChanged(changes)) {
            this.reload();
        }
    }

    private isPropertyChanged(changes: SimpleChanges): boolean {
        let changed: boolean = false;

        let appId = changes['appId'];
        let processDefinitionKey = changes['processDefinitionKey'];
        let state = changes['state'];
        let sort = changes['sort'];
        let name = changes['name'];

        if (appId && appId.currentValue) {
            changed = true;
        } else if (processDefinitionKey && processDefinitionKey.currentValue) {
            changed = true;
        } else if (state && state.currentValue) {
            changed = true;
        } else if (sort && sort.currentValue) {
            changed = true;
        } else if (name && name.currentValue) {
            changed = true;
        }
        return changed;
    }

    public reload() {
        this.requestNode = this.createRequestNode();
        this.load(this.requestNode);
    }

    private load(requestNode: ProcessFilterParamRepresentationModel) {
        this.isLoading = true;
        this.processService.getProcessInstances(requestNode, this.processDefinitionKey)
            .subscribe(
                (response) => {
                    let instancesRow = this.createDataRow(response);
                    this.renderInstances(instancesRow);
                    this.selectFirst();
                    this.success.emit(response);
                    this.isLoading = false;
                },
                error => {
                    this.error.emit(error);
                    this.isLoading = false;
                });
    }

    /**
     * Create an array of ObjectDataRow
     * @param instances
     * @returns {ObjectDataRow[]}
     */
    private createDataRow(instances: any[]): ObjectDataRow[] {
        let instancesRows: ObjectDataRow[] = [];
        instances.forEach((row) => {
            instancesRows.push(new ObjectDataRow(row));
        });
        return instancesRows;
    }

    /**
     * Render the instances list
     *
     * @param instances
     */
    private renderInstances(instances: any[]) {
        instances = this.optimizeNames(instances);
        this.setDatatableSorting();
        this.data.setRows(instances);
    }

    /**
     * Sort the datatable rows based on current value of 'sort' property
     */
    private setDatatableSorting() {
        if (!this.sort) {
            return;
        }
        let sortingParams: string[] = this.sort.split('-');
        if (sortingParams.length === 2) {
            let sortColumn = sortingParams[0] === 'created' ? 'started' : sortingParams[0];
            let sortOrder = sortingParams[1];
            this.data.setSorting(new DataSorting(sortColumn, sortOrder));
        }
    }

    /**
     * Select the first instance of a list if present
     */
    selectFirst() {
        if (!this.isListEmpty()) {
            let row = this.data.getRows()[0];
            row.isSelected = true;
            this.data.selectedRow = row;
            this.currentInstanceId = row.getValue('id');
        } else {
            if (this.data) {
                this.data.selectedRow = null;
            }
            this.currentInstanceId = null;
        }
    }

    /**
     * Return the current id
     * @returns {string}
     */
    getCurrentId(): string {
        return this.currentInstanceId;
    }

    /**
     * Check if the list is empty
     * @returns {ObjectDataTableAdapter|boolean}
     */
    isListEmpty(): boolean {
        return this.data === undefined ||
            (this.data && this.data.getRows() && this.data.getRows().length === 0);
    }

    /**
     * Emit the event rowClick passing the current task id when the row is clicked
     * @param event
     */
    onRowClick(event: DataRowEvent) {
        let item = event;
        this.currentInstanceId = item.value.getValue('id');
        this.rowClick.emit(this.currentInstanceId);
    }

    /**
     * Emit the event rowClick passing the current task id when pressed the Enter key on the selected row
     * @param event
     */
    onRowKeyUp(event: CustomEvent) {
        if (event.detail.keyboardEvent.key === 'Enter') {
            event.preventDefault();
            this.currentInstanceId = event.detail.row.getValue('id');
            this.rowClick.emit(this.currentInstanceId);
        }
    }

    /**
     * Optimize name field
     * @param instances
     * @returns {any[]}
     */
    private optimizeNames(instances: any[]) {
        instances = instances.map(t => {
            t.obj.name = this.getProcessNameOrDescription(t.obj, 'medium');
            return t;
        });
        return instances;
    }

    getProcessNameOrDescription(processInstance, dateFormat): string {
        let name = '';
        if (processInstance) {
            name = processInstance.name ||
                processInstance.processDefinitionName + ' - ' + this.getFormatDate(processInstance.started, dateFormat);
        }
        return name;
    }

    getFormatDate(value, format: string) {
        let datePipe = new DatePipe('en-US');
        try {
            return datePipe.transform(value, format);
        } catch (err) {
            return '';
        }
    }

    private createRequestNode() {
        let requestNode = {
            appDefinitionId: this.appId,
            state: this.state,
            sort: this.sort
        };
        return new ProcessFilterParamRepresentationModel(requestNode);
    }

    setupDefaultColumns(preset: string = 'default'): void {
        if (this.data) {
            const columns = this.getLayoutPreset(preset);
            this.data.setColumns(columns);
        }
    }

    private loadLayoutPresets(): void {
        const externalSettings = this.appConfig.get('adf-process-list.presets', null);

        if (externalSettings) {
            this.layoutPresets = Object.assign({}, processPresetsDefaultModel, externalSettings);
        } else {
            this.layoutPresets = processPresetsDefaultModel;
        }

    }

    private getLayoutPreset(name: string = 'default'): DataColumn[] {
        return (this.layoutPresets[name] || this.layoutPresets['default']).map(col => new ObjectDataColumn(col));
    }
}
