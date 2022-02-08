import React from "react";
import "./DialogHint.css";
import Popup from "reactjs-popup";

export default class DialogHint extends React.Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		return (
			<Popup
				trigger={<i className="DialogHint-icon far fa-question-circle"/>}
				closeOnDocumentClick
				modal
				className={"DialogHint Popup-small-size"}
			>
				{(close) => (
					<div className={"DialogHint-wrapper"}>
						<div className="DialogHint-inside-icon-wrapper">
							<i className="DialogHint-inside-icon fas fa-question-circle"/>
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
