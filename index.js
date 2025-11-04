class Enum extends Number {}


Object.defineProperty(Enum.prototype, "toString", {value: function (){ return this.constructor.name }})     
Object.defineProperty(Enum.prototype, "valueOf", {value: function (){ return this.constructor.value }})     
Object.defineProperty(Enum.prototype, Symbol.toPrimitive, {value: function (hint){
    return (hint === "number") && this.valueOf() || this.toString();
}});

const enums = new Map()

function enumerate ( name = `UNDEFINED`, value ) {
    if (enums.has(name)) { return enums.get(name) };
    if (enums.has(value)) {
        const ref = enums.get(value);
        
        if (ref.toString() === name) {
            return ref;
        }

        throw new ReferenceError(
            `Enum value of ${value} used for ${ref} {${value}}`
        );
    };

    if (typeof value !== "number") {
        if (typeof enumerate.iterate === "number") {
            value = enumerate.iterate++;
        }
        else {
            value = Array
                .from(`${name}`)
                .map((c,i) => c.charCodeAt()*++i)
                .reduce((v,p) => v+p, 0)
            ;   
        }
    }
    
    const object = new class extends Enum {} (value);
    const prototype = Object.getPrototypeOf(object);
    const constructor = Reflect.get(object, "constructor");

    Object.defineProperty(constructor, "value", {value: value});     
    Object.defineProperty(constructor, "name", {value: name});     
    Object.defineProperty(prototype, Symbol.toStringTag, {value: name });     

    enums.set(value, object);
    enums.set(name, object);
    enums.set(object, value);

    return object;
}

const definitions = {
    is : { value : function ( value ) { return value - this === 0; } },
    not : { value : function ( value ) { return value - this !== 0; } },
};

Object.defineProperties(Number.prototype, definitions);
Object.defineProperties(BigInt.prototype, definitions);

Object.defineProperty(enumerate, "iterate", { value: false, writable: true });
Object.defineProperty(enumerate, "valueOf", { value: Map.prototype.get.bind(enums) });

export default enumerate;