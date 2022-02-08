import React from "react";
import "./DialogMessage.css";
import Popup from "reactjs-popup";

export default class DialogMessage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<Popup
				trigger={<div className="DialogMessage-trigger">
					{this.props.trigger}
				</div>}
				modal
				closeOnDocumentClick
				className={"DialogMessage"}
				open={this.props.open}
			>
				{(close) => (
					<div className={"DialogMessage-wrapper"}>
						{this.props.text}
						<div className={"bottom-right-buttons"}>
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
