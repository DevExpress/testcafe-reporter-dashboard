import { Selector } from 'testcafe';

fixture `Fixture 1`
    .page `https://devexpress.github.io/testcafe/example`;

test('Test 1', async t => {
    await t
        .click(Selector('#developer-name'), { speed: 0.5, modifiers: { ctrl: true } })
        .typeText(Selector('#developer-name'), 'Peter')
        .click(Selector('#tried-test-cafe'))
        .drag(Selector('.ui-slider-handle.ui-corner-all.ui-state-default'), 94, -2, {
            offsetX: 8,
            offsetY: 12
        })
        .hover(Selector("#endregion"))
        .expect(Selector('#developer-name').value).eql('Peter1');
});
