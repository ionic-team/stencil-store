import { newE2EPage, E2EPage } from '@stencil/core/testing';

describe('display-store', () => {
  it('re-renders', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<display-store store-key="hello"></display-store><change-store store-key="hello" store-value="other-value"></change-store>'
    );

    expect(await displayedValue(page)).toEqual('hola');
    expect(await renderCount(page)).toEqual(1);

    await changeValue(page);

    expect(await displayedValue(page)).toEqual('other-value');
    expect(await renderCount(page)).toEqual(2);
  });

  it('does not rerender if the key changed is a different one', async () => {
    const page = await newE2EPage();
    await page.setContent(
      '<display-store class="hello" store-key="hello"></display-store><display-store class="goodbye" store-key="goodbye"></display-store><change-store store-key="hello" store-value="other-value"></change-store>'
    );

    expect(await displayedValue(page, '.hello')).toEqual('hola');
    expect(await renderCount(page, '.hello')).toEqual(1);
    expect(await displayedValue(page, '.goodbye')).toEqual('adiós');
    expect(await renderCount(page, '.goodbye')).toEqual(1);

    await changeValue(page);

    expect(await displayedValue(page, '.hello')).toEqual('other-value');
    expect(await renderCount(page, '.hello')).toEqual(2);
    expect(await displayedValue(page, '.goodbye')).toEqual('adiós');
    expect(await renderCount(page, '.goodbye')).toEqual(1);
  });
});

const displayedValue = async (page: E2EPage, parentSelector?: string): Promise<string> => {
  const parentElement = parentSelector === undefined ? page : await page.find(parentSelector);
  const element = await parentElement.find('.value');

  return element.textContent;
};

const renderCount = async (page: E2EPage, parentSelector?: string): Promise<number> => {
  const parentElement = parentSelector === undefined ? page : await page.find(parentSelector);
  const element = await parentElement.find('.counter');

  return parseInt(element.textContent, 10);
};

const changeValue = async (page: E2EPage, newValue?: string): Promise<void> => {
  if (newValue !== undefined) {
    const element = await page.find('change-store');

    element.setProperty('store-value', newValue);
  }
  const button = await page.find('button');

  await button.click();

  await page.waitForChanges();
};
