import React, { Component } from 'react';


export class Game extends Component {
	updateStats(stats) {
		console.log(stats);
		this.setState({
			playerHealth: stats.health,
			weapon: stats.weapon,
			attack: stats.attack
		});
	}
	constructor(props) {
		super(props);
		this.state = {
			playerHealth: 0,
			attack: 0,
			weapon: 'none'
		}
		this.updateStats = this.updateStats.bind(this);
	}
	render() {
		return(
				<section className="gameBoard">
					<StatBar health={this.state.playerHealth} />
					<Player updateStats={this.updateStats}/>
				</section>
			)
	}
}
class StatBar extends Component {
	render() {
		const stats = [['Health', this.props.health], ['Weapon', this.props.weapon], ['Attack', this.props.attack]]
		return(
			<ul className="HUD">
			{
				stats.map((ele) => {
				return <li key={stats.indexOf(ele)}>{ele[0] + ': ' + ele[1]}</li>
			})}
			</ul>
			)
	}
}
class Player extends Component {
	componentDidMount() {
		this.props.updateStats({health: this.state.health, weapon: this.state.weapon, attack: this.state.attack});
		window.addEventListener('keydown', this.handleMove);
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
				break;	
		}
	}
	constructor(props) {
		super(props);
		this.state = {
			health: 100,
			weapon: 'none',
			attack: 5,
			height:'10px',
			width:'10px',
			top: 5
		}
		this.handleMove = this.handleMove.bind(this);
	}
	render() {
		return(
			<div className="player" style={{height:this.state.height, width:this.state.height}}></div>
		)
	}
}