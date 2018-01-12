pragma solidity ^0.4.0;


contract RentCar{
    
    struct Car{
        string car_brand;
        string car_model;
        uint car_rent;
        uint position;
        Status status;
    }
    
    struct Customer {
        string customername;
        uint from;
        uint to;
        uint carindex;
    }

    //state variables
    address owner;
    uint amount;

    //collections
    Car[] cars;
    address[] customerlist;
    enum Status { Available, Hired }
    mapping(address => Customer) customers;

    //event to track
    event addCarStatus(bool _Status, uint _TimeStamp);
    event hireStatus(bool _IsHired, string message, uint _TimeStamp);
    

    function RentCar(){
        owner = msg.sender;
    }
    
    modifier isOwner(){
        if(owner != msg.sender) throw;
        _;
    }
    
    function addCar(string car_brand, string car_model, uint car_rent)
        isOwner() public
    {
        bool flag = true;
        var size = cars.length;
        
        if(size > 0)
        {
            for(uint8 i=0; i < size; i++)
            {
                Car c = cars[i];
                if((keccak256(c.car_brand) == keccak256(car_brand)) && (keccak256(c.car_model) == keccak256(car_model)))
                {
                    flag = false;
                    break;
                }
            }
            
            if(flag)
            {
                appendCar(car_brand,car_model,car_rent,Status.Available);
                addCarStatus(true, block.timestamp);
            }
            else
            {
                //car already exist
                addCarStatus(false, block.timestamp);
            }
        }
        else
        {
             appendCar(car_brand,car_model,car_rent,Status.Available);
            addCarStatus(true, block.timestamp);
        }
    }
    
    function appendCar(string _car_brand,string _car_model,uint _car_rent,Status _status) internal{
        cars.length++;
        uint index = cars.length-1;
        cars[index].car_brand = _car_brand;
        cars[index].car_model = _car_model;
        cars[index].car_rent = _car_rent;
        cars[index].status = _status;
        cars[index].position = index;
    }

    function hireCar(uint index, string customer_name, uint from, uint to, uint dayscount)
        payable public
    {
        var size = cars.length;
        
        //check car count
        if(size > 0)
        {
            //get car stored a specific index
            Car c = cars[index];

            //check the car status
            if(c.status == Status.Available)
            {
                //calculate the rent
                 uint totalrent = (dayscount * c.car_rent);
                
                //check ether is account is sufficient to hire car
                if(totalrent == msg.value)
                {
                    customers[msg.sender] = Customer(customer_name, from, to, index);
                    customerlist.push(msg.sender);
                    amount += msg.value;
                    c.status = Status.Hired;
                    hireStatus(true,"Car hired", block.timestamp);
                }
                else
                {
                    hireStatus(false, "Insufficient balance", block.timestamp);
                }
            }
            else 
            {
                hireStatus(false,"No car available to hire", block.timestamp);
            }
        }
    }

    function getCarLength() public returns(uint)
    {
        return cars.length;
    }

    function getAddressLength() public returns(uint)
    {
        return customerlist.length;
    }

    function CustomerDetails(address index) public returns(string,string,uint,string,uint,uint)
    {
        Customer cust = customers[index];
        Car c = cars[cust.carindex];

        return (c.car_brand,c.car_model,c.car_rent, cust.customername, cust.from, cust.to);
    }

    function CarDetails(uint index) returns(string,string,uint,uint,uint)
    {
        Car c = cars[index];
        return (c.car_brand,c.car_model,c.car_rent,(uint)(c.status),c.position);
    }

    function getAddressAt(uint index) returns(address)
    {
        return (customerlist[index]);
    }
}