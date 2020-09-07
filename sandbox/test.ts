import { Selector, Role } from 'testcafe';

fixture`Fixture 1`
    .page`https://devexpress.github.io/testcafe/example`;

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

test('Match typeOf Within', async t => {
    await t.expect('foobar').match(/^f/, 'this assertion should pass');
    await t.expect('bar').notMatch(/^f/);

    await t.expect({ a: 'bar' }).typeOf('object', 'it\'s an object');
    await t.expect('bar').notTypeOf('number', 'string is not a number');

    await t.expect(5).within(3, 10, 'this assertion should pass');
    await t.expect(1).notWithin(3, 10, 'this assertion should pass');
});

test('Window actions', async t => {
    await t.openWindow('https://devexpress.com');
    const devexpress = await t.getCurrentWindow();
    await t.closeWindow(devexpress);
    await t.resizeWindowToFitDevice('Sony Xperia Z', {
        portraitOrientation: true
    });
    await t.setPageLoadTimeout(0);
    await t.setTestSpeed(0.1);
    await t.openWindow('https://devexpress.com')
        .switchToParentWindow()
        .switchToPreviousWindow();;

    await t.switchToWindow('https://devexpress.com');
    await t.switchToIframe('#iframe-1');
});


const role = Role("https://ru-ru.facebook.com/login", async t => {
    await t
        .typeText('#email', 'username')
        .typeText('#pass', 'password')
        .click('#loginbutton');
}, { preserveUrl: true });

test('Role', async t => {
    await t
        .navigateTo('https://ru-ru.facebook.com/login')
        .useRole(role);
});

