import React, { Component } from "react";
import "./Log.css";
import Popup from "reactjs-popup";
import FormLine from "../button/FormLine.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";

export default class Log extends Component {
	constructor(props) {
		super(props);

		this.onClick = this.onClick.bind(this);
		this.onClose = this.onClose.bind(this);
		this.onOpen = this.onOpen.bind(this);

		this.state = {
		};
	}

	onClick() {
		if (typeof this.props.disabled !== "undefined" || !this.props.disabled) {
			this.onOpen();

			const newState = !this.props.selected;
			if (typeof this.props.onClick !== "undefined") this.props.onClick(this.props.id, newState);
		}
	}

	onClose() {
		this.setState({ isDetailOpened: false });
	}

	onOpen() {
		this.setState({ isDetailOpened: true });
	}

	render() {
		return (
			<Popup
				className="Popup-small-size"
				trigger={
					<div className={"Log"}>
						<i className="fas fa-history"/>
						<div className={"Log-name"}>
							{this.props.info !== undefined && this.props.info !== null
								? this.props.info.request + " " + this.props.info.sys_date
								: "Unfound log"
							}
						</div>
					</div>
				}
				modal
				closeOnDocumentClick
				onClose={this.onClose}
				onOpen={this.onOpen}
			>
				<div className="row">
					<div className="col-md-12">
						<h2>
							{this.props.info !== undefined && this.props.info !== null
								? "Log " + this.props.info.sys_date
								: "Unfound log"
							}
						</h2>
					</div>

					{this.props.info !== undefined && this.props.info !== null
						? <div className="col-md-12">
							<FormLine
								label={"Resource"}
								value={this.props.info.request}
								disabled={true}
							/>
							<FormLine
								label={"Method"}
								value={this.props.info.request_method}
								disabled={true}
							/>
							<FormLine
								label={"Status code"}
								value={this.props.info.status_code}
								disabled={true}
							/>
							<FormLine
								type={"textarea"}
								label={"Status description"}
								value={this.props.info.status_description}
								disabled={true}
							/>
							<FormLine
								label={"System date"}
								value={this.props.info.sys_date}
								disabled={true}
							/>
						</div>
						: <Loading
							height={250}
						/>
					}

					<div className="col-md-12">
						<h3>Parameters</h3>
					</div>

					{this.props.info !== undefined && this.props.info !== null
						&& this.props.info.params !== null
						&& <div className="col-md-12">
							{JSON.stringify(this.props.info.params, null, 4)}
						</div>
					}

					{this.props.info !== undefined && this.props.info !== null
						&& this.props.info.params === null
						&& <Message
							height={150}
							text={"No parameter for this request"}
						/>
					}

					{(this.props.info === undefined || this.props.info === null)
						&& <Loading
							height={150}
						/>
					}
				</div>
			</Popup>
		);
	}
}
