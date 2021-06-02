import React from "react";
import "./DialogSelectImage.css";
import Popup from "reactjs-popup";
import { NotificationManager as nm } from "react-notifications";
import Image from "../item/Image.jsx";
import { getRequest } from "../../utils/request.jsx";
import Loading from "../box/Loading.jsx";
import Message from "../box/Message.jsx";
import DialogAddImage from "./DialogAddImage.jsx";

export default class DialogSelectImage extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.onSelect = this.onSelect.bind(this);

		this.state = {
			images: null,
		};
	}

	componentDidMount() {
		this.refresh();
	}

	refresh() {
		this.setState({
			images: null,
		});

		getRequest.call(this, "media/get_images", (data) => {
			this.setState({
				images: data.sort((a, b) => b.id - a.id),
			});
		}, (response) => {
			nm.warning(response.statusText);
		}, (error) => {
			nm.error(error.message);
		});
	}

	onSelect(id, close) {
		if (this.props.validateSelection !== undefined) {
			this.props.validateSelection(id);
			close();
		}
	}

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<Popup
				className={"Popup-small-size DialogSelectImage"
					+ (this.state.open ? " DialogSelectImage-opened" : "")}
				trigger={this.props.trigger}
				modal
				closeOnDocumentClick
			>
				{(close) => <div className={"row DialogSelectImage-content"}>
					<div className={"col-md-12"}>
						<div className="top-right-buttons">
							<DialogAddImage
								trigger={
									<button
										className={"blue-background"}
										data-hover="Filter">
										<span><i className="fas fa-plus"/></span>
									</button>
								}
								afterValidate={this.refresh}
							/>
							<button
								className={"grey-background"}
								data-hover="Close"
								data-active=""
								onClick={close}>
								<span><i className="far fa-times-circle"/></span>
							</button>
						</div>
						<h2>Select image</h2>
					</div>
					<div className={"col-md-12"}>
						{this.state.images === null
							&& <Loading
								height={300}
							/>
						}

						{this.state.images !== null && this.state.images.length === 0
							&& <Message
								text={"No media in the library"}
								height={300}
							/>
						}

						{this.state.images !== null && this.state.images.length > 0
							&& <div className="row">
								{this.state.images.map((i) => (
									<div
										key={i.id}
										className="col-xl-2 col-md-4 col-sm-6 DialogSelectImage-content-image">
										<Image
											id={i.id}
											thumbnail={i.thumbnail}
											height={i.height}
											width={i.width}
											creationDate={i.creation_date}
										/>
										<div>
											<button
												data-hover="Select"
												data-active=""
												onClick={() => this.onSelect(i.id, close)}>
												<span>Select</span>
											</button>
										</div>
									</div>
								))}
							</div>
						}
					</div>
				</div>
				}
			</Popup>
		);
	}
}
