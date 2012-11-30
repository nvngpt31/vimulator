(function () {
    var C, deleteSubCommands, changeSubCommands;

    C = Vimulator.Command;

    deleteSubCommands = {
        'd': new C({
            callback: function (vim, count) {
                vim.moveCursorRelative(count - 1, 0);
            }
        })
    };

    changeSubCommands = {
        'c': new C({
            callback: function (vim, count) {
                vim.moveCursorRelative(count - 1, 0);
            }
        }),
        'w': Vimulator.NormalMode.Motions['e'],
        'W': Vimulator.NormalMode.Motions['E'],
    };

    Vimulator.NormalMode.Operators = {
        'd': new C({
            argument: "operation",
            callback: function (vim, count, motion) {
                var before, after;

                before = {row: vim.cursor.row, col: vim.cursor.col};
                motion.multiply(count);
                motion.execute(vim);
                after = {row: vim.cursor.row, col: vim.cursor.col};

                // Some motions delete the character the cursor lands on,
                // other motions do not
                if (/[Ee$ftFT]/.test(motion.commandKey)) {
                    after.col += 1;
                }

                // d, j and k delete whole rows
                if (/[dj]/.test(motion.commandKey)) {
                    vim.removeRows(before.row, after.row + 1);
                    vim.moveCursorRow(before.row);
                    vim.moveCursorCol(vim.currentLine().search(/[^\s]/));
                } else if (/[k]/.test(motion.commandKey)) {
                    vim.removeRows(after.row, before.row + 1);
                    vim.moveCursorRow(after.row);
                    vim.moveCursorCol(vim.currentLine().search(/[^\s]/));
                } else {
                    vim.removeRange(before, after);
                }
            },
            subCommands: new Vimulator.CommandList(
                deleteSubCommands,
                Vimulator.NormalMode.Motions,
                Vimulator.NormalMode.LineSearch
            )
        }),

        'c': new C({
            argument: "operation",
            callback: function (vim, count, motion) {
                var before, after;

                before = {row: vim.cursor.row, col: vim.cursor.col};
                motion.multiply(count);
                motion.execute(vim);
                after = {row: vim.cursor.row, col: vim.cursor.col};

                // Some motions change the character the cursor lands on,
                // other motions do not
                if (/[EeWw$ftFT]/.test(motion.commandKey)) {
                    after.col += 1;
                }

                // c, j and k change whole rows
                if (/[cj]/.test(motion.commandKey)) {
                    vim.removeRows(before.row + 1, after.row + 1);
                    vim.replaceRow('', before.row);
                    vim.moveCursor(before.row, 0);
                } else if (/[k]/.test(motion.commandKey)) {
                    vim.removeRows(after.row + 1, before.row + 1);
                    vim.replaceRow('', after.row);
                    vim.moveCursor(after.row, 0);
                } else {
                    vim.removeRange(before, after);
                    if (before.row > after.row || before.row == after.row && before.col > after.col) {
                        vim.moveCursor(after.row, after.col);
                    } else {
                        vim.moveCursor(before.row, before.col);
                    }
                }

                if (motion.commandKey === '$') {
                    vim.cursor.col += 1;
                }

                vim.setMode("insert");
            },
            subCommands: new Vimulator.CommandList(
                changeSubCommands,
                Vimulator.NormalMode.Motions,
                Vimulator.NormalMode.LineSearch
            )
        })
    };
}());