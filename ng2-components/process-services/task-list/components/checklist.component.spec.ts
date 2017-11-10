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

import { SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AppConfigService, TranslationService } from '@adf/core';
import { AppConfigServiceMock } from '../assets/app-config.service.mock';
import { TranslationMock } from '../assets/translation.service.mock';
import { TaskDetailsModel } from '../models/task-details.model';
import { TaskListService } from '../services/tasklist.service';
import { ChecklistComponent } from './checklist.component';
import { MaterialModule } from '../../material.module';

declare let jasmine: any;

const fakeTaskDetail = new TaskDetailsModel({
    id: 'fake-check-id',
    name: 'fake-check-name'
});

describe('ChecklistComponent', () => {

    let checklistComponent: ChecklistComponent;
    let fixture: ComponentFixture<ChecklistComponent>;
    let element: HTMLElement;
    let showChecklistDialog, closeCheckDialogButton;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [

                MaterialModule
            ],
            declarations: [
                ChecklistComponent
            ],
            providers: [
                TaskListService,
                { provide: AppConfigService, useClass: AppConfigServiceMock },
                { provide: TranslationService, useClass: TranslationMock }
            ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(ChecklistComponent);
            checklistComponent = fixture.componentInstance;
            element = fixture.nativeElement;

            fixture.detectChanges();
        });
    }));

    it('should show checklist component title', () => {
        expect(element.querySelector('#checklist-label')).toBeDefined();
        expect(element.querySelector('#checklist-label')).not.toBeNull();
    });

    it('should show no checklist message', () => {
        expect(element.querySelector('#checklist-none-message')).not.toBeNull();
        expect(element.querySelector('#checklist-none-message').textContent).toContain('ADF_TASK_LIST.DETAILS.CHECKLIST.NONE');
    });

    describe('when is readonly mode', () => {

        beforeEach(() => {
            checklistComponent.taskId = 'fake-task-id';
            checklistComponent.checklist.push(fakeTaskDetail);
            checklistComponent.readOnly = true;

            fixture.detectChanges();
            showChecklistDialog = <HTMLElement> element.querySelector('#add-checklist');
            closeCheckDialogButton = <HTMLElement> element.querySelector('#close-check-dialog');
        });

        it('should NOT show add checklist button', () => {
            expect(element.querySelector('#add-checklist')).toBeNull();
        });

        it('should NOT show cancel checklist button', () => {
            expect(element.querySelector('#remove-fake-check-id')).toBeNull();
        });
    });

    describe('when is not in readonly mode', () => {

        beforeEach(() => {
            checklistComponent.taskId = 'fake-task-id';
            checklistComponent.readOnly = false;
            checklistComponent.checklist.push(fakeTaskDetail);

            fixture.detectChanges();
            showChecklistDialog = <HTMLElement> element.querySelector('#add-checklist');
            closeCheckDialogButton = <HTMLElement> element.querySelector('#close-check-dialog');
        });

        it('should show add checklist button', () => {
            expect(element.querySelector('#add-checklist')).not.toBeNull();
        });

        it('should show cancel checklist button', () => {
            expect(element.querySelector('#remove-fake-check-id')).not.toBeNull();
        });
    });

    describe('when interact with checklist dialog', () => {

        beforeEach(() => {
            checklistComponent.taskId = 'fake-task-id';
            checklistComponent.checklist = [];

            fixture.detectChanges();
            showChecklistDialog = <HTMLElement> element.querySelector('#add-checklist');
            closeCheckDialogButton = <HTMLElement> element.querySelector('#close-check-dialog');
        });

        it('should show dialog when clicked on add', () => {
            expect(showChecklistDialog).not.toBeNull();
            showChecklistDialog.click();

            expect(window.document.querySelector('#checklist-dialog')).not.toBeNull();
            expect(window.document.querySelector('#add-checklist-title')).not.toBeNull();
            expect(window.document.querySelector('#add-checklist-title').textContent).toContain('New Check');
        });
    });

    describe('when there are task checklist', () => {

        beforeEach(() => {
            checklistComponent.taskId = 'fake-task-id';
            checklistComponent.checklist = [];
            fixture.detectChanges();
            showChecklistDialog = <HTMLElement> element.querySelector('#add-checklist');
        });

        beforeEach(() => {
            jasmine.Ajax.install();
        });

        afterEach(() => {
            jasmine.Ajax.uninstall();
            const overlayContainers = <any> window.document.querySelectorAll('.cdk-overlay-container');
            overlayContainers.forEach((overlayContainer) => {
                overlayContainer.innerHTML = '';
            });
        });

        it('should show task checklist', () => {
            checklistComponent.checklist.push(fakeTaskDetail);
            fixture.detectChanges();
            expect(element.querySelector('#check-fake-check-id')).not.toBeNull();
            expect(element.querySelector('#check-fake-check-id').textContent).toContain('fake-check-name');
        });

        it('should add checklist', async(() => {
            showChecklistDialog.click();
            let addButtonDialog = <HTMLElement> window.document.querySelector('#add-check');
            addButtonDialog.click();
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: { id: 'fake-check-added-id', name: 'fake-check-added-name' }
            });
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(element.querySelector('#check-fake-check-added-id')).not.toBeNull();
                expect(element.querySelector('#check-fake-check-added-id').textContent).toContain('fake-check-added-name');
            });
        }));

        it('should remove a checklist element', async(() => {
            checklistComponent.taskId = 'new-fake-task-id';
            checklistComponent.checklist.push(fakeTaskDetail);
            fixture.detectChanges();
            let checklistElementRemove = <HTMLElement> element.querySelector('#remove-fake-check-id');
            expect(checklistElementRemove).toBeDefined();
            expect(checklistElementRemove).not.toBeNull();
            checklistElementRemove.click();
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json'
            });
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(element.querySelector('#fake-check-id')).toBeNull();
            });
        }));

        it('should send an event when the checklist is deleted', (done) => {
            checklistComponent.taskId = 'new-fake-task-id';
            checklistComponent.checklist.push(fakeTaskDetail);
            fixture.detectChanges();
            let checklistElementRemove = <HTMLElement> element.querySelector('#remove-fake-check-id');
            expect(checklistElementRemove).toBeDefined();
            expect(checklistElementRemove).not.toBeNull();
            checklistElementRemove.click();
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json'
            });
            checklistComponent.checklistTaskDeleted.subscribe(() => {
                expect(element.querySelector('#fake-check-id')).toBeNull();
                done();
            });
        });

        it('should show load task checklist on change', async(() => {
            checklistComponent.taskId = 'new-fake-task-id';
            checklistComponent.checklist.push(fakeTaskDetail);
            fixture.detectChanges();
            let change = new SimpleChange(null, 'new-fake-task-id', true);
            checklistComponent.ngOnChanges({
                taskId: change
            });
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: { data: [{ id: 'fake-check-changed-id', name: 'fake-check-changed-name' }] }
            });
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(element.querySelector('#check-fake-check-changed-id')).not.toBeNull();
                expect(element.querySelector('#check-fake-check-changed-id').textContent).toContain('fake-check-changed-name');
            });
        }));

        it('should show empty checklist when task id is null', async(() => {
            checklistComponent.taskId = 'new-fake-task-id';
            checklistComponent.checklist.push(fakeTaskDetail);
            fixture.detectChanges();
            checklistComponent.taskId = null;
            let change = new SimpleChange(null, 'new-fake-task-id', true);
            checklistComponent.ngOnChanges({
                taskId: change
            });
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(element.querySelector('#checklist-none-message')).not.toBeNull();
                expect(element.querySelector('#checklist-none-message').textContent).toContain('ADF_TASK_LIST.DETAILS.CHECKLIST.NONE');
            });
        }));

        it('should emit checklist task created event when the checklist is successfully added', (done) => {
            checklistComponent.checklistTaskCreated.subscribe((taskAdded: TaskDetailsModel) => {
                fixture.detectChanges();
                expect(taskAdded.id).toEqual('fake-check-added-id');
                expect(taskAdded.name).toEqual('fake-check-added-name');
                expect(element.querySelector('#check-fake-check-added-id')).not.toBeNull();
                expect(element.querySelector('#check-fake-check-added-id').textContent).toContain('fake-check-added-name');
                done();
            });
            showChecklistDialog.click();
            let addButtonDialog = <HTMLElement> window.document.querySelector('#add-check');
            addButtonDialog.click();
            jasmine.Ajax.requests.mostRecent().respondWith({
                status: 200,
                contentType: 'json',
                responseText: { id: 'fake-check-added-id', name: 'fake-check-added-name' }
            });
        });
    });

});
