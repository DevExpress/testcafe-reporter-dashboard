module.exports = function () {
    return {
        noColors: true,
        
        reportTaskStart (/* startTime, userAgents, testCount */) {
            throw new Error('Not implemented');
        },

        reportFixtureStart (/* name, path */) {
            throw new Error('Not implemented');
        },

        reportTestStart (/* name, testMeta */) {
            // NOTE: This method is optional.
        },

        reportTestDone (/* name, testRunInfo */) {
            throw new Error('Not implemented');
        },

        reportTaskDone (/* endTime, passed, warnings */) {
            throw new Error('Not implemented');
        }
    };
};
