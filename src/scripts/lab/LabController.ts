class LabController {

    public static openLabModal() {
        if (App.game.lab.canAccess()) {
            $('#labModal').modal('show');
        } else {
            // TODO: HLXII - Update with access requirements
            /*
            Notifier.notify({
                message: `You need the ${GameConstants.humanifyString(KeyItems.KeyItem[KeyItems.KeyItem.Wailmer_pail])} to access this location`,
                type: NotificationConstants.NotificationOption.warning,
            });
            */
        }
    }

    //#region Worker Assignment

    public static selectedResearchSlot: KnockoutObservable<number> = ko.observable(0);

    public static visible(partyPokemon: PartyPokemon) {
        return ko.pureComputed(() => {
            // Only working Pokemon
            if (partyPokemon.location !== PartyLocation.Battle) {
                return false;
            }

            const research = App.game.lab.currentResearch()[LabController.selectedResearchSlot()];
            if (research?.research?.workerFilter && !research?.research?.workerFilter?.filter(partyPokemon)) {
                return false;
            }

            return BreedingController.applyFilter(partyPokemon);
        });
    }

    public static handleClick(partyPokemon: PartyPokemon) {
        const research = App.game.lab.currentResearch()[LabController.selectedResearchSlot()];
        if (!research) {
            return;
        }
        if (research.workers.length === research?.maxWorkers) {
            return;
        }
        research.addWorker(partyPokemon);

        // Check if close Modal
        if (research.workers.length === research.maxWorkers) {
            $('#partyListModal').modal('hide');
        }
    }

    public static openPartyListModal(index: number) {
        LabController.selectedResearchSlot(index);
        $('#partyListModal').modal('show');
    }

    //#endregion

    //#region Research

    public static openResearchListModal() {
        if (ResearchHandler.researchList.length === 0) {
            ResearchHandler.researchList = App.game.lab.researchList.map(research => research.id);
            ResearchHandler.filterResearchList();
        }
        $('#researchListModal').modal('show');
    }

    //#endregion

    //#region Machines

    public static selectedMachine: KnockoutObservable<Machine | undefined> = ko.observable(undefined);

    public static cursorOnGrid: KnockoutObservable<boolean> = ko.observable(false);
    public static cursorX: KnockoutObservable<number> = ko.observable(0);
    public static cursorY: KnockoutObservable<number> = ko.observable(0);

    public static hoverTopMargin: KnockoutComputed<string> = ko.pureComputed(() => {
        return `${LabController.cellHeight() * (LabController.cursorY() + 1)}%`;
    })
    public static hoverLeftMargin: KnockoutComputed<string> = ko.pureComputed(() => {
        return `${LabController.cellWidth() * (LabController.cursorX() + 1)}%`;
    })

    public static machineWidth: KnockoutComputed<string> = ko.pureComputed(() => {
        return `${LabController.cellWidth() * (LabController.selectedMachine() ? LabController.selectedMachine().width : 0)}%`;
    });
    public static machineHeight: KnockoutComputed<string> = ko.pureComputed(() => {
        return `${LabController.cellHeight() * (LabController.selectedMachine() ? LabController.selectedMachine().height : 0)}%`;
    });

    public static labColumns: KnockoutComputed<number> = ko.pureComputed(() => Lab.labSizes[App.game.lab.labLevel()].x);
    public static labRows: KnockoutComputed<number> = ko.pureComputed(() => Lab.labSizes[App.game.lab.labLevel()].y);

    public static cellWidth: KnockoutComputed<number> = ko.pureComputed(() => 100 / (LabController.labColumns() + 2));
    public static cellHeight: KnockoutComputed<number> = ko.pureComputed(() => 100 / (LabController.labRows() + 1));

    public static selectedMachineVisible: KnockoutComputed<boolean> = ko.pureComputed(() => {
        if (!LabController.cursorOnGrid()) {
            return false;
        }

        // Handle super-illegal positions
        const machine = LabController.selectedMachine();
        if (!machine) {
            return false;
        }
        if (LabController.cursorY() + machine.height > LabController.labRows()) {
            return false;
        }
        if (LabController.cursorX() + machine.width > LabController.labColumns()) {
            return false;
        }

        return true;
    });

    public static setupGrid() {
        const grid = $('#labGrid');

        const top = LabController.cellHeight();
        grid.css('top', `${top}%`);
        const left = LabController.cellWidth();
        grid.css('left', `${left}%`);
        const width = 100 - (2 * left);
        grid.css('width', `${width}%`);
        const height = 100 - top;
        grid.css('height', `${height}%`);
    }

    public static updateHover(x: number, y:number) {
        console.log(`Update hover on ${x}, ${y}`);

        // Show machine hover
        LabController.cursorOnGrid(true);

        // Update cursor positions
        LabController.cursorX(x);
        LabController.cursorY(y);
    }

    public static clearHover() {
        console.log('Clear hover');

        // Hide machine hover
        LabController.cursorOnGrid(false);
    }

    public static openMachineListModal() {
        if (MachineHandler.machineList.length === 0) {
            MachineHandler.machineList = App.game.lab.machines;
            MachineHandler.filterMachineList();
        }
        $('#machineListModal').modal('show');
    }

    //#endregion

}
