export class WxAggregator {

  private alphabet: any[] = [];

  public doWork() {
    let alphaProcess = this.createAlphabet();

    alphaProcess.then((results) => {
      console.log('Alpha done:', results);
      console.log('Alpha done - alphabet:', this.alphabet);

      // this.search();
    });
  }

  public async createAlphabet(): Promise<any> {
    let promises = [];
    let letter;

    for (let i = 0; i < 26; i++) {
      letter = (i + 10).toString(36);

      promises.push(this.alphabet.push(letter));
    }

    return await Promise.all(promises);
  }

  private search() {

  }
}
