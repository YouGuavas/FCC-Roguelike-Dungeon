import React, { Component } from 'react';
import wizard from './wizard.svg';
import goblin from './goblin.svg';
import dragon from './dragon.svg';
import spellbook from './spellbook.svg';
const weapons = [
	{
		itemName: 'Forsaken Manual',
		itemType: 'spellbook',
		attack: 4
	},
	{
		itemName: 'Lifebender Codex',
		itemType: 'spellbook',
		attack: 10
	},
	{
		itemName: 'Tome of Chaos',
		itemType: 'spellbook',
		attack: 14
	},
	{
		itemName: 'Shadowbinder, Grimoire of Nightmares',
		itemType: 'spellbook',
		attack: 20
	},
	{
		itemName: 'Deathsong, Prophecy of Darkness',
		itemType: 'spellbook',
		attack: 24
	},
	{
		itemName: 'FuzzyWuzzy, Wicked Manuscript of Fluff',
		itemType: 'spellbook',
		attack: 29
	}
];
let occupied = {};
let entityPos = {};
export class Game extends Component {
	updateStats(stats) {
		this.setState({
			playerHealth: stats.health,
			weapon: stats.weapon,
			attack: stats.attack
		});
	}
	gainExp(next, callback) {
		const levelUp = (xp) => {
			let level = this.state.level+1;
			let leftovers = xp - (this.state.level*20)
			let baseHealth = this.state.baseHealth + Math.floor(0.1*this.state.baseHealth);
			let baseAttack = this.state.baseAttack + Math.floor(0.05*this.state.baseAttack) + 2;
			while (leftovers >= level*20) {
				leftovers = leftovers - (level*20);
				baseHealth += Math.floor(0.1*baseHealth);
				baseAttack += Math.floor(0.5*baseAttack) + 2;
				level += 1;
			}

			return [level, leftovers, baseHealth, baseAttack];
		}
		this.setState({
			xp: this.state.xp + next
		}, () => {
			if (this.state.xp >= this.state.level*20) {
				const levels = levelUp(this.state.xp);
				this.setState({
					level: levels[0],
					xp: levels[1]
					//leftover xp carries over
				}, () => {
						this.setState({
							baseHealth: levels[2],
							baseAttack: levels[3]
							//this math is a bit not as intended, but I figured it shouldn't matter in this case, because in most situations in the game, player won't level more than once at a time
						}, () => {
								this.setState({
									playerHealth: this.state.baseHealth,
									attack: this.state.baseAttack + this.state.itemAttack
								})
						});
				});
			};
		});
		callback();
	}
	getItem = () => {
		this.setState({
			weapon:weapons[this.state.floor-1].itemName,
			attack:this.state.baseAttack + weapons[this.state.floor-1].attack,
			itemAttack: weapons[this.state.floor-1].attack
		});
	}
	resetBoard = () => {
		this.setState({
			level: 1,
			baseHealth: 100,
			playerHealth: 100,
			baseAttack:1,
			itemAttack: 0,
			attack: 1,
			weapon: 'A tattered paperback',
			floor: 1,
			xp: 0,
			playerPos: {x: 0, y:0}
		}, () => {
			this.drawBoard();
		});
	}
	handleMove(e) {
		const battle = (pos) => {
			const enemyAttack = Math.floor(Math.random() * (1.5*entityPos[pos].attack - entityPos[pos].attack)) + entityPos[pos].attack;
			const myAttack = Math.floor(Math.random() * (1.5*this.state.attack - this.state.attack)) + this.state.attack;
			const enemyHealth = entityPos[pos].health -= myAttack;
			if (this.state.playerHealth - enemyAttack > 0) {
				//check if player is still alive
				this.setState({
					//if so, reduce health by "random" enemy attack amount
					playerHealth: this.state.playerHealth - enemyAttack
				});
				if (enemyHealth <= 0) {
					//check if enemy is still alive
					if (entityPos[pos].type === 'enemy') {
						//if not, and if enemy is not a boss, gain exp and proceed
						this.gainExp(entityPos[pos].xp, () => { 
							delete entityPos[pos]
						});
						return 'win';
					} else {
						//if you have killed a boss, gain xp and advance to the next floor
						this.setState({
							floor: this.state.floor + 1
						}, () => {
							this.gainExp(entityPos[pos].xp, () => {
								delete entityPos[pos]
							});
							occupied = {};
							entityPos = {};
							this.setState({
								playerHealth: this.state.baseHealth
							}, () => {
								this.drawBoard();
							});
						});
					}
				}
			} else {
				this.resetBoard();
			}
		}
		const testNext = (x,y,x2,y2) => {
			const img = new Image();
			img.onload = () => {
				if (Object.keys(entityPos).indexOf(`${x2}x${y2}`) === -1) {
					//If new position is not occupied, move
					cont.clearRect(x, y, width, height);
					cont.drawImage(img, x2, y2, width, height);
					this.setState({
						playerPos: {x:x2, y: y2}
					});
				} else if (entityPos[`${x2}x${y2}`].type === "item") {
					//If new position is occupied by an item, pick it up and move on
					cont.clearRect(x, y, width,height);
					cont.drawImage(img, x2, y2, width,height);
					delete entityPos[`${x2}x${y2}`];
					this.setState({
						playerPos: {x:x2, y:y2}
					}, () => {
						this.getItem();
					});
				} else {
					//If new position is occupied by a boss or other enemy, battle it
					if (battle(`${x2}x${y2}`) === 'win') {
						cont.clearRect(x, y, width, height);
						cont.drawImage(img, x2, y2, width, height);
						this.setState({
							playerPos: {x:x2, y: y2}
						});
					};
				}
			}
			img.src = wizard;
		}
		const height = this.state.entitySize.y;
		const width = this.state.entitySize.x;
		const canvas = document.getElementById("canvas");
		const cont = canvas.getContext('2d');
		switch (e.keyCode) {
			case 65:
			case 37:
				//left
				e.preventDefault();
				if (this.state.playerPos.x-width >= 0) {
					//leftmost border
					testNext(this.state.playerPos.x, this.state.playerPos.y, this.state.playerPos.x-width, this.state.playerPos.y);
				}
				break;
			case 87:
			case 38:
				//up
				e.preventDefault();
				if (this.state.playerPos.y-height >= 0) {
					//upper border
					testNext(this.state.playerPos.x, this.state.playerPos.y, this.state.playerPos.x, this.state.playerPos.y-height);
				}
				break;
			case 68:
			case 39:
				//right
				e.preventDefault();
				if (this.state.playerPos.x+width <= this.state.boardD.x) {
					//rightmost border
					testNext(this.state.playerPos.x, this.state.playerPos.y, this.state.playerPos.x+width, this.state.playerPos.y);
				}
				break;
			case 83:
			case 40:
				//down
				e.preventDefault();
				if (this.state.playerPos.y+height <= this.state.boardD.y) {
					//lower border
					testNext(this.state.playerPos.x, this.state.playerPos.y, this.state.playerPos.x, this.state.playerPos.y+height);
				}
				break;
			default:
				this.gainExp(200, () => { return null; });
				break;	
		}
	}
	drawBoard = () => {
		const img = new Image(); 
		img.onload = () => {
			const types = {'player': [wizard, 1], 'item': [spellbook, 1], 'boss': [dragon, 1], 'enemy': [goblin, 3]};
			let sprites = [];
			const canvas = document.getElementById("canvas");
			const cont = canvas.getContext('2d');

			const loadImgs = (type, x, y) => {
				if (type !== 'player') {
					const image = new Image();
					//sprites.push(image);
					image.onload = () => {
							cont.drawImage(image, x, y, this.state.entitySize.x, this.state.entitySize.y);
					}
					occupied[`${x}x${y}`] = type;
					occupied[`${x+this.state.entitySize.x}x${y}`] = type;
					occupied[`${x}x${y+this.state.entitySize.y}`] = type;
					occupied[`${x+this.state.entitySize.x}x${y+this.state.entitySize.y}`] = type;
					entityPos[`${x}x${y}`] = {type: type, 
							health: type === 'enemy' ? this.state.floor * 10 : type === 'boss' ? this.state.floor*30 : 0,
							attack: type === 'enemy' ? this.state.floor*3 : type === 'boss' ? this.state.floor*3 : 0,
							xp: type === 'enemy' ? this.state.floor*4 : type === 'boss' ? this.state.floor*10 : 0
						}
						image.src = types[type][0];
					}
			}

			cont.clearRect(0, 0, canvas.width, canvas.height);
			let x = Math.floor(Math.random() * (this.state.boardD.x/this.state.entitySize.x));
			x *= this.state.entitySize.x;
			let y = Math.floor(Math.random() * (this.state.boardD.y/this.state.entitySize.y));
			y *= this.state.entitySize.y;
			cont.drawImage(img, x, y, this.state.entitySize.x, this.state.entitySize.y);
			//establish a "grid" for player, items, enemies to spawn on
			this.setState({
				playerPos: {x, y}
			}, () => {
				for (let i = 0; i < Object.keys(types).length; i++) {
					const type = Object.keys(types)[i];
					const number = types[type][1];
					occupied[`${x}x${y}`] = type;
					occupied[`${x+this.state.entitySize.x}x${y}`] = type;
					occupied[`${x}x${y+this.state.entitySize.y}`] = type;
					occupied[`${x+this.state.entitySize.x}x${y+this.state.entitySize.y}`] = type;
					if (type === 'item' && this.state.floor > weapons.length) {
						null;
					} else {
						for (let j = 0; j < number; j++) {
							while(Object.keys(occupied).indexOf(`${x}x${y}`) !== -1) {
								x = Math.floor(Math.random() * (this.state.boardD.x/this.state.entitySize.x));
								x *= this.state.entitySize.x;
								y = Math.floor(Math.random() * (this.state.boardD.y/this.state.entitySize.y));
								y *= this.state.entitySize.y;
							};
							loadImgs(type, x, y);
							//alert(x, y);
						}
						for(let j = 0; j < sprites.length; j++) {
							cont.drawImage(sprites[j], x, y, this.state.entitySize.x, this.state.entitySize.y);
						}
					}
				}
			});
			console.log(sprites);
		}
		img.src = wizard;
	}
	
	componentDidMount() {
		this.drawBoard();
		window.addEventListener('keydown', this.handleMove);
	}
	constructor(props) {
		super(props);
		this.state = {
			level: 1,
			baseHealth: 100,
			playerHealth: 100,
			baseAttack:1,
			itemAttack: 0,
			attack: 1,
			weapon: 'A tattered paperback',
			floor: 1,
			xp: 0,
			boardD: {x: 200, y: 150},
			playerPos: {x: 0, y:0},
			entitySize: {x: 20, y: 15},
		}
		this.updateStats = this.updateStats.bind(this);
		this.handleMove = this.handleMove.bind(this);
		this.gainExp = this.gainExp.bind(this);
	}
	render() {
		return(
			<section className="gameBoard">
				<StatBar stats={{floor: this.state.floor,level: this.state.level, health: this.state.playerHealth, baseHealth:this.state.baseHealth, weapon:this.state.weapon, attack:this.state.attack, xp:this.state.xp}} />
				<canvas className="gameBoard" id="canvas"></canvas>
			</section>
			)
	}
}
class HealthBar extends Component {
	render() {
		const width = 50;
		let color;
		if (this.props.width <= .3) {
			color = 'red';
		} else {
			color = 'green';
		}
		return(
			<div className='hbC' style={{width}}>
				<div className='hbI' style={{width:this.props.width*width, backgroundColor:color}}></div>
			</div>
			)
	}
}
class StatBar extends Component {
	render() {
		const stats = [['Floor', this.props.stats.floor], ['Level', this.props.stats.level],['Health', this.props.stats.health], ['Exp', this.props.stats.xp], ['Weapon', this.props.stats.weapon], ['Attack', this.props.stats.attack]]
		return(
			<ul className="HUD">
			{
				stats.map((ele) => {
					if (ele[0] !== 'Exp' && ele[0] !== 'Health') {
						return <li key={stats.indexOf(ele)}><strong>{ele[0] + ': '}</strong> {ele[1]}</li>
					} else if (ele[0] === 'Health') {
						return <li key={stats.indexOf(ele)}><strong>{ele[0] + ': '}</strong><HealthBar width={ele[1]/this.props.stats.baseHealth}/></li>
					}else {
						return <li key={stats.indexOf(ele)}><strong>{ele[0] + ' Left: '}</strong> {(this.props.stats.level*20 - ele[1])}</li>
					}
			})}
			</ul>
			)
	}
}