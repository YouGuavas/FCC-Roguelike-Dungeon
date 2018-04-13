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


export class Game extends Component {
	updateStats(stats) {
		this.setState({
			playerHealth: stats.health,
			weapon: stats.weapon,
			attack: stats.attack
		});
	}
	gainExp(next) {
		this.setState({
			xp: this.state.xp + next
		}, () => {
			if (this.state.xp >= this.state.level*10) {
				this.setState({
					level: this.state.level + Math.floor(this.state.xp/(this.state.level*10)),
					playerHealth: this.state.playerHealth + Math.floor(this.state.xp/(this.state.level*11)*10),
					attack: this.state.attack + 2,
					xp:0
				});
			}
		});
	}

	handleMove(e) {
		switch (e.keyCode) {
			case 65:
			case 37:
				console.log('left');
				break;
			case 87:
			case 38:
				console.log('up');
				break;
			case 68:
			case 39:
				console.log('right');
				break;
			case 83:
			case 40:
				console.log('down');
				break;
			default:
				this.gainExp(3);
				break;	
		}
	}
	drawBoard() {
		const canvas = document.getElementById("canvas");
		const cont = canvas.getContext('2d');
		cont.fillStyle = "#FF0000";
		cont.fillRect(Math.floor(Math.random()*300), Math.random(Math.random()*500), 5,3);
	}
	componentDidMount() {
		this.drawBoard();
		window.addEventListener('keydown', this.handleMove);
	}
	constructor(props) {
		super(props);
		this.state = {
			level: 1,
			playerHealth: 100,
			attack: 1,
			weapon: 'A tattered paperback',
			floor: 1,
			xp: 0
		}
		this.updateStats = this.updateStats.bind(this);
		this.drawBoard = this.drawBoard.bind(this);
		this.handleMove = this.handleMove.bind(this);
		this.gainExp = this.gainExp.bind(this);
	}
	render() {
		return(
			<section className="gameBoard">
				<StatBar stats={{level: this.state.level, health: this.state.playerHealth, weapon:this.state.weapon, attack:this.state.attack, xp:this.state.xp}} />
				<canvas className="gameBoard" id="canvas"></canvas>
			</section>
			)
	}
}
class StatBar extends Component {
	render() {
		const stats = [['Level', this.props.stats.level],['Health', this.props.stats.health], ['Exp', this.props.stats.xp], ['Weapon', this.props.stats.weapon], ['Attack', this.props.stats.attack]]
		return(
			<ul className="HUD">
			{
				stats.map((ele) => {
				return <li key={stats.indexOf(ele)}><strong>{ele[0] + ': '}</strong> {ele[1]}</li>
			})}
			</ul>
			)
	}
}