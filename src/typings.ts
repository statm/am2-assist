// Info about one type of aircraft
export type AircraftInfo = {
    id: number,
    name: string,
    category: number,
    speed: number,
    range: number,
    price: number,
    seats: number,
    payload: number
};

// Info about one aircraft of player's fleet
export type AircraftData = {
    id: number,
    name: string,
    aircraftListName: string,
    category: number,
    consumption: number,
    hubId: number,
    isCargo: false,
    isRental: false,
    lineList: any,
    payloadUsed: 8,
    picture: string,
    planningList: Array<any>,
    range: number,
    seatsBus: number,
    seatsEco: number,
    seatsFirst: number,
    speed: number,
    utilizationPercentage: number
};

// Info about one route of player's network
export type RouteData = {
    id: number,
    name: string,
    airportOneId: number,
    airportTwoId: number,
    baseDuration: number,
    category: number,
    color: string,
    distance: number,
    paxAttBus: number,
    paxAttCargo: number,
    paxAttEco: number,
    paxAttFirst: number,
    remaining: Array<Pax>
};

export type Pax = {
    eco: number,
    bus: number,
    first: number,
    cargo: number
};

export enum SeatClass {
    ECO = 0,
    BUS,
    FIRST,
    CARGO
};

export type FlightParameters = {
    boardingTime: number,
    landingTime: number,
    transitionTime: number
};

// Aggregated info about player's aircrafts and flight network
export type NetworkData = {
    aircraftList: Array<AircraftData>,
    routeList: Array<RouteData>,
    aircraftMap: {[id: number]: AircraftData},
    routeMap: {[id: number]: RouteData},
    flightParameters: FlightParameters
};
