import { browser, by, element } from 'protractor';

export class ProductsPage {
  navigateTo() {
    return browser.get('/productos');
  }

  getTitleText() {
    browser.waitForAngularEnabled(false);
    return element(by.css('h1')).getText();
  }
}
