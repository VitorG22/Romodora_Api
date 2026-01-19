import type Game from "../gameClass"

export type TEntity = Entity | Character


export interface IEntity {
    name: string,
    id: string,
    picture: string,
    life: number,
    maxLife: number,
    position: { x: number, y: number }
    lastPosition: { x: number, y: number }
    inventory: Array<{
        id: string
        subSelectionId?: string
        name: string
        picture?: string
        amount: number
        maxStack: number
        rarity: "Common" | "Uncommon" | "Rare" | "Very Rare" | "Legendary"
        price: number
        description: string
        weight: number
        type: "meleeWeapon" | "rangedWeapon" | "armor" | "shield" | "tool" | "ammo" | "kit" | "accessories" | "consumable" | "catalysts" | "bag" | "materials"
    }>
    emitChange?: (EntityData: TEntity) => void
}


export class Entity {
    name; id; picture; life; maxLife; position; lastPosition; inventory; emitChange;

    constructor(data: IEntity) {
        this.name = data.name
        this.id = data.id
        this.picture = data.picture
        this.life = data.life
        this.maxLife = data.maxLife
        this.position = data.position
        this.lastPosition = data.lastPosition || { x: -99999, y: -99999 }
        this.inventory = data.inventory
        this.emitChange = data.emitChange
    }

    changePosition({gameInstance,x,y}:{gameInstance:Game, x: number, y: number}) {

        // check if another entity is in the desired position
        for(let player of gameInstance.tableControl.players){
            if(player.character?.position.x == x && player.character.position.y == y){return}
        }
        
        this.lastPosition = this.position
        this.position = {
            x: x,
            y: y
        }
        this.emitChange?.(this)
    }

    heal(healValue: number) {
        if (this.life + healValue >= this.maxLife) {
            this.life = this.maxLife
        } else {
            this.life += healValue
        }
        this.emitChange?.(this)
    }

    damage(damageValue: number) {
        if (this.life - damageValue <= 0) {
            this.life = 0
        } else {
            this.life -= damageValue
        }
        this.emitChange?.(this)
    }

}


export interface ICharacter extends IEntity {
    level:number
    class: string,
    subClass: string,
    race: string,
    subRace: string,
    attributes: {
        strength: number,
        dexterity: number,
        constitution: number,
        intelligence: number,
        wisdom: number,
        charisma: number,
    }
}

export class Character extends Entity{
    class;subClass;race;subRace;attributes;level;
    constructor(data:ICharacter){
        super(data)
        this.level =  data.level
        this.class =  data.class
        this.subClass =  data.subClass
        this.race =  data.race
        this.subRace =  data.subRace
        this.attributes = data.attributes
    }

    changeAttribute({attribute, value}:{attribute:"strength"|"dexterity"|"constitution"|"intelligence"|"wisdom"|"charisma", value: number}){
        this.attributes[attribute] = value
        this.emitChange?.(this)
    }
    
}