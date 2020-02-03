import { Selector } from 'testcafe';

fixture `Fixture 1`
    .page `https://devexpress.github.io/testcafe/example`;

test('Test 1', async t => {
    const header = Selector('h1').withText('Example');

    await t
        .takeScreenshot()
        .expect(header.textContent).eql('Example1');
});
