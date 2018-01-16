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

import { AppsProcessService, NotificationService, TranslationService } from '@alfresco/adf-core';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'select-process-dialog',
    templateUrl: 'select-process-app-dialog-component.html'
})
export class SelectProcessAppDialogComponent {

    processApps: any;

    selectedProcess: any;

    constructor(private appsProcessService: AppsProcessService,
                private translateService: TranslationService,
                private notificationService: NotificationService,
                public dialogRef: MatDialogRef<SelectProcessAppDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any) {

        this.appsProcessService.getDeployedApplications().subscribe(
            (apps: any[]) => {
                this.processApps = apps.filter((currentApp)=>{
                    return currentApp.id;
                });
            },
            (err) => {
                const translatedErrorMessage: any = this.translateService.get('PROCESS.DIALOG.ERROR');
                this.notificationService.openSnackMessage(translatedErrorMessage.value, 4000);
            }
        );

    }

    onStart(): void {
        this.dialogRef.close(this.selectedProcess);
    }
}
