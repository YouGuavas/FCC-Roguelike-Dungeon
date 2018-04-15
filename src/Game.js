import React, { Component } from 'react';
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
		this.setState({
			xp: this.state.xp + next
		}, () => {
			if (this.state.xp >= this.state.level*10) {
				this.setState({
					level: this.state.level + Math.floor(this.state.xp/(this.state.level*10)),
					baseHealth: this.state.baseHealth + Math.floor(this.state.xp/(this.state.level*11)*10),
					baseAttack: this.state.baseAttack + 2,
					xp:0
				}, () => {
					this.setState({
						playerHealth: this.state.baseHealth,
						attack: this.state.baseAttack + this.state.itemAttack
					});
				});
			}
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
	handleMove(e) {
		const battle = (pos) => {
			const enemyAttack = Math.floor(Math.random() * 1.5*entityPos[pos].attack);
			const myAttack = Math.floor(Math.random() * 1.5*this.state.attack);
			const enemyHealth = entityPos[pos].health -= myAttack;
			if (enemyHealth > 0) {
				this.setState({
					playerHealth: this.state.playerHealth - enemyAttack
				});
			} else {
				if (entityPos[pos].type === 'enemy') {
					this.gainExp(entityPos[pos].xp, () => { 
						delete entityPos[pos]
					});
					return 'win';
				} else {
					this.setState({
						floor: this.state.floor + 1
					}, () => {
						this.gainExp(entityPos[pos].xp, () => {
							delete entityPos[pos]
						});
						occupied = {};
						entityPos = {};
						this.drawBoard();
					});
				}
			}
		}
		const testNext = (x,y,x2,y2) => {
			if (Object.keys(entityPos).indexOf(`${x2}x${y2}`) === -1) {
				//If new position is not occupied, move
				cont.clearRect(x, y, width, height);
				cont.fillRect(x2, y2, width, height);
				this.setState({
					playerPos: {x:x2, y: y2}
				});
			} else if (entityPos[`${x2}x${y2}`].type === "item") {
				//If new position is occupied by an item, pick it up and move on
				cont.clearRect(x, y, width,height);
				cont.fillRect(x2, y2, width,height);
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
					cont.fillRect(x2, y2, width, height);
					this.setState({
						playerPos: {x:x2, y: y2}
					});
				};
			}
		}
		const height = this.state.entitySize.y;
		const width = this.state.entitySize.x;
		const canvas = document.getElementById("canvas");
		const cont = canvas.getContext('2d');
		cont.fillStyle = 'red';
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
				this.gainExp(3);
				break;	
		}
	}
	drawBoard = () => {
		const types = {'player': ['#FF0000', 1], 'item': ['green', 1], 'boss': ['purple', 1], 'enemy': ['blue', 3]};
		const canvas = document.getElementById("canvas");
		const cont = canvas.getContext('2d');
		cont.clearRect(0, 0, canvas.width, canvas.height);
		let x = Math.floor(Math.random() * (this.state.boardD.x/this.state.entitySize.x));
		x *= this.state.entitySize.x;
		let y = Math.floor(Math.random() * (this.state.boardD.y/this.state.entitySize.y));
		y *= this.state.entitySize.y;
		//establish a 
		this.setState({
			playerPos: {x, y}
		}, () => {
			for (let i = 0; i < Object.keys(types).length; i++) {
				const type = Object.keys(types)[i];
				const color = types[type][0];
				const number = types[type][1];
				for (let j = 0; j < number; j++) {
					while(Object.keys(occupied).indexOf(`${x}x${y}`) !== -1) {
						x = Math.floor(Math.random() * (this.state.boardD.x/this.state.entitySize.x));
						x *= this.state.entitySize.x;
						y = Math.floor(Math.random() * (this.state.boardD.y/this.state.entitySize.y));
						y *= this.state.entitySize.y;
					};
					occupied[`${x}x${y}`] = type;
					if (type !== 'player') {
						entityPos[`${x}x${y}`] = {type: type, 
							health: type === 'enemy' ? this.state.floor * 10 : type === 'boss' ? this.state.floor*30 : 0,
							attack: type === 'enemy' ? this.state.floor*3 : type === 'boss' ? this.state.floor*3 : 0,
							xp: type === 'enemy' ? this.state.floor*4 : type === 'boss' ? this.state.floor*10 : 0
						};
					}
					occupied[`${x+this.state.entitySize.x}x${y}`] = type;
					occupied[`${x}x${y+this.state.entitySize.y}`] = type;
					occupied[`${x+this.state.entitySize.x}x${y+this.state.entitySize.y}`] = type;
					cont.fillStyle = color;
					cont.fillRect(x, y, this.state.entitySize.x,this.state.entitySize.y);
				}
			}
			console.log(entityPos);
		});
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
			entitySize: {x: 6, y: 4},
		}
		this.updateStats = this.updateStats.bind(this);
		this.handleMove = this.handleMove.bind(this);
		this.gainExp = this.gainExp.bind(this);
	}
	render() {
		return(
			<section className="gameBoard">
				<StatBar stats={{floor: this.state.floor,level: this.state.level, health: this.state.playerHealth, weapon:this.state.weapon, attack:this.state.attack, xp:this.state.xp}} />
				<canvas className="gameBoard" id="canvas"></canvas>
			</section>
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
					if (ele[0] !== 'Exp') {
						return <li key={stats.indexOf(ele)}><strong>{ele[0] + ': '}</strong> {ele[1]}</li>
					} else {
						return <li key={stats.indexOf(ele)}><strong>{ele[0] + ': '}</strong> {ele[1] + ' (Exp to level: ' + (this.props.stats.level*10 - ele[1]) + ')'}</li>
					}
			})}
			</ul>
			)
	}
}