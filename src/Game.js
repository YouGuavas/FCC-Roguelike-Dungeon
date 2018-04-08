import React, { Component } from 'react';


export class Game extends Component {
	updateStats(stats) {
		this.setState({
			playerHealth: stats
		});
	}
	constructor(props) {
		super(props);
		this.state = {
			playerHealth: 0
		}
		this.updateStats = this.updateStats.bind(this);
	}
	render() {
		return(
				<section className="gameBoard">
					<section className="HUD">{this.state.playerHealth}</section>
					<Player updateStats={this.updateStats}/>
				</section>
			)
	}
}

class Player extends Component {
	componentDidMount() {
		this.props.updateStats(this.state.health);
	}
	handleMove(e) {
		alert('oy');
	}
	constructor(props) {
		super(props);
		this.state = {
			health: 100,
			height:'10px',
			width:'10px'
		}
		this.handleMove = this.handleMove.bind(this);
	}
	render() {
		return(
			<div className="player" style={{height:this.state.height, width:this.state.height}} onKeyPress={this.handleMove}></div>
		)
	}
}