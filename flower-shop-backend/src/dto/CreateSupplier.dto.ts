export class CreateSupplierDto {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    city: string;
    create_date: Date;
    constructor(
        name: string,
        contact_person: string,
        email: string,
        phone: string,
        address: string,
        country: string,
        city: string,
        create_date: Date
    ) {
        this.name = name;
        this.contact_person = contact_person;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.country = country;
        this.city = city;
        this.create_date = create_date;
    }
}