require('chromedriver');
const fs = require('fs');
const webdriver = require('selenium-webdriver');
const { By, until } = webdriver;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const driver = new webdriver.Builder().forBrowser('chrome').build();
const expect = chai.expect;

const config = {
  url: '';
  user: '',
  pass: ''
}

const login = (driver, done, intent) => {
  const { url, user } = config;
  let { pass } = config;
  if (intent === 'fail') pass += '-';
  driver.get(url).then(res => {
    driver
      .findElement(By.id('inputLoginModalEmail'))
      .sendKeys(user)
      .then(() => {
        driver
          .findElement(By.id('inputLoginModalPassword'))
          .sendKeys(pass)
      })
      .then(() => {
        driver
          .findElement(By.css("button[type='submit']"))
          .click()
      })
      .then(() => {
        const el = intent === 'fail' ? 'alert-danger' : 'leaflet-container';
        driver
          .wait(until.elementLocated(By.className(el)))
          .then(() => done())
      }
    );
  });
}

const takeScreenshot = (driver, name) => {
  driver
    .takeScreenshot()
    .then((image, err) => {
      fs.writeFile(`e2e/reports/${name}.png`, image, 'base64',
        err => console.log(err)
      );
    });
}

describe('Test Login Fail', done => {
  const intent = 'fail';
  before(done => login(driver, done, intent));

  it(`Login ${intent}`, () => {
    driver
      .sleep(500)
      .then(() => takeScreenshot(driver, `login_${intent}`));
    return  expect(driver
              .findElement(By.className('alert-danger'))
              .getAttribute('innerHTML')
            ).to.eventually.contain('password is not valid');
  });
});

describe('Test Login Success', done => {
  const intent = 'succees';
  before(done => login(driver, done, intent));

  it(`Login ${intent}`, () => {
    driver
      .sleep(10000)
      .then(() => takeScreenshot(driver, `login_${intent}`));
    return expect(driver
      .findElement(By.className('leaflet-container'))
      .getAttribute('innerHTML')
    ).to.eventually.contain('leaflet-map-pane');
  });
});
