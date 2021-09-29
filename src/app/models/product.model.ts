export class Product {
  public imageFeaturedUrl?;

  constructor(
    public id: number = 1,
    public date: string = new Date().toISOString().split('T')[0],
    public name: string = '',
    public description: string = '',
    public price: number = 0,
    public priceNormal: number = 0,
    public reduction: number = 0,
    public imageURLs: string[] = [],
    public imageRefs: string[] = [],
    public categories: string[] = [],
    public ratings: {} = {},
    public currentRating: number = 0,
    public sale: boolean = false,
    public stockSizeS: number = 0,
    public stockSizeM: number = 0,
    public stockSizeL: number = 0,
    public stockSizeXL: number = 0,
  ) {}
}
