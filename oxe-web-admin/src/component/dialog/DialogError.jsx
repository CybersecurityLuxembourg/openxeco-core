import React from "react";
import "./DialogError.css";
import Popup from "reactjs-popup";

export default class DialogError extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<Popup
				trigger={<i className="DialogError-icon fas fa-exclamation-circle"/>}
				closeOnDocumentClick
				modal
				className={"DialogError Popup-small-size"}
			>
				{(close) => (
					<div className={"DialogError-wrapper"}>
						<div className="DialogError-inside-icon-wrapper">
							<i className="DialogError-inside-icon fas fa-exclamation-circle"/>
						</div>

						{this.props.content}

						<div className={"right-buttons"}>
							<button
								data-hover="Ok"
								data-active=""
								onClick={close}>
								<i className="far fa-check-circle"/> Ok
							</button>
						</div>
					</div>
				)}
			</Popup>
		);
	}
}
