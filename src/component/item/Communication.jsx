import React, { Component } from "react";
import "./Communication.css";
import Popup from "reactjs-popup";

export default class Communication extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		return (
			<Popup
				trigger={
					<div className={"Communication"}>
						<i className="fas fa-bullhorn"/>
						<div className={"Log-name"}>
							{this.props.info.subject}
						</div>
					</div>
				}
				modal
			>
				{(close) => <div className="row">
					<div className={"col-md-9"}>
						<h3>{this.props.info.subject}</h3>
					</div>
					<div className={"col-md-3"}>
						<div className="right-buttons">
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
					</div>

					<div className={"col-md-12"}>
						{this.props.info.body}
					</div>

					<div className={"col-md-12"}>
						{this.props.info.addresses}
					</div>

					<div className={"col-md-12"}>
						{this.props.info.status}
					</div>

					<div className={"col-md-12"}>
						{this.props.info.sys_date}
					</div>
				</div>}
			</Popup>
		);
	}
}
