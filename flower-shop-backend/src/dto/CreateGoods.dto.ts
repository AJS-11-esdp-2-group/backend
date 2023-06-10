export class CreateGoodsDto {
    name: string;
    goods_description: string;
    goods_category: string;
    image_small: string;
    image_large: string;
    create_date: Date;
    who_create: string;
    constructor(
        name: string,
        goods_description: string,
        goods_category: string,
        image_small: string,
        image_large: string,
        create_date: Date,
        who_create: string,
    ) {
        this.name = name;
        this.goods_description = goods_description;
        this.goods_category = goods_category;
        this.image_small = image_small;
        this.image_large = image_large;
        this.create_date = create_date;
        this.who_create = who_create;
    }
}