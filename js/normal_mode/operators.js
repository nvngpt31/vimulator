(function () {
    var C, U, deleteSubCommands, changeSubCommands;

    C = Vimulator.Command;
    U = Vimulator.Utils;

    deleteSubCommands = {
        'd': new C({
            repeatable: true,
            callback: function (vim, count) {
                vim.moveCursorRelative(count - 1, 0);
            },
            description: function (count) {
                return U.pluralize(count, "whole line");
            }
        })
    };

    changeSubCommands = {
        'c': new C({
            repeatable: true,
            callback: function (vim, count) {
                vim.moveCursorRelative(count - 1, 0);
            },
            description: function (count) {
                return U.pluralize(count, "whole line");
            }
        }),
        'w': Vimulator.NormalMode.Motions['e'],
        'W': Vimulator.NormalMode.Motions['E'],
    };

    Vimulator.NormalMode.Operators = {
        'd': new C({
            repeatable: true,
            argument: "operation",
            defaultCount: null,
            callback: function (vim, count, motion) {
                var before, after, range, firstRow, lastRow;

                before = {row: vim.cursor.row, col: vim.cursor.col};
                range = motion.execute(vim, count);
                after = {row: vim.cursor.row, col: vim.cursor.col};

                //TODO Refactor normal motions to return a range.
                //  Would allow a lot of the logic here to be moved.
                if (/[ai]/.test(motion.commandKey)) {
                    if (!range) {
                        return;
                    }

                    range.removeFrom(vim);
                    vim.moveCursor(range.start.row, range.start.col);
                    return;
                }

                // Some motions delete the character the cursor lands on,
                // other motions do not
                if (/[Ee$ftFTai]/.test(motion.commandKey)) {
                    after.col += 1;
                }

                // d, G, gg, j and k delete whole rows
                if (/[djkG]|gg/.test(motion.commandKey)) {
                    if (before.row < after.row) {
                        firstRow = before.row;
                        lastRow = after.row + 1;
                    } else {
                        firstRow = after.row;
                        lastRow = before.row + 1;
                    }

                    vim.removeRows(firstRow, lastRow);
                    vim.moveCursor(lastRow, '^');
                } else {
                    vim.removeRange(before, after);
                }
            },
            subCommands: new Vimulator.CommandList(
                deleteSubCommands,
                Vimulator.NormalMode.Motions,
                Vimulator.NormalMode.LineSearch,
                Vimulator.TextObject.Commands
            ),
            description: function (count, motion) {
                var desc = "Delete ";
                if (motion) {
                    return desc + motion.description();
                } else {
                    return desc + "<b>&hellip;</b>";
                }
            }
        }),

        'c': new C({
            repeatable: true,
            argument: "operation",
            defaultCount: null,
            callback: function (vim, count, motion) {
                var before, after, range, firstRow, lastRow;

                before = {row: vim.cursor.row, col: vim.cursor.col};
                range = motion.execute(vim, count);
                after = {row: vim.cursor.row, col: vim.cursor.col};

                //TODO Refactor normal motions to return a range.
                //  Would allow a lot of the logic here to be moved.
                if (/[ai]/.test(motion.commandKey)) {
                    if (!range) {
                        return;
                    }

                    range.replaceIn(vim, "");
                    vim.moveCursor(range.start.row, range.start.col);
                    vim.setMode("insert");
                    return;
                }

                // Some motions change the character the cursor lands on,
                // other motions do not
                if (/[EeWw$ftFTai]/.test(motion.commandKey)) {
                    after.col += 1;
                }

                // c, j and k change whole rows
                if (/[cjkG]|gg/.test(motion.commandKey)) {
                    if (before.row < after.row) {
                        firstRow = before.row;
                        lastRow = after.row + 1;
                    } else {
                        firstRow = after.row;
                        lastRow = before.row + 1;
                    }

                    vim.removeRows(firstRow + 1, lastRow);
                    vim.replaceRow('', firstRow);
                    vim.moveCursor(firstRow, 0);
                } else {
                    vim.removeRange(before, after);
                    if (before.row > after.row || before.row == after.row && before.col > after.col) {
                        vim.moveCursor(after.row, after.col - 1);
                    } else {
                        vim.moveCursor(before.row, before.col - 1);
                    }
                }

                if (vim.cursor.col > 0) {
                    vim.cursor.col += 1; //FIXME
                }
                vim.setMode("insert");
            },
            subCommands: new Vimulator.CommandList(
                changeSubCommands,
                Vimulator.NormalMode.Motions,
                Vimulator.NormalMode.LineSearch,
                Vimulator.TextObject.Commands
            ),
            description: function (count, motion) {
                var desc = "Change ";
                if (motion) {
                    return desc + motion.description();
                } else {
                    return desc + "<b>&hellip;</b>";
                }
            }
        })
    };
}());
