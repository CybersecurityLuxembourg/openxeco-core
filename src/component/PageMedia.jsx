import React from "react";
import "./PageMedia.css";
import { NotificationManager as nm } from "react-notifications";
import Loading from "./box/Loading.jsx";
import Message from "./box/Message.jsx";
import Image from "./item/Image.jsx";
import { getRequest } from "../utils/request.jsx";
import DialogAddImage from "./dialog/DialogAddImage.jsx";

export default class PageMedia extends React.Component {
	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);

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

	changeState(field, value) {
		this.setState({ [field]: value });
	}

	render() {
		return (
			<div id="PageMedia" className="page max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>Media</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
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
						</div>
					</div>
				</div>
				<div className={"row row-spaced"}>
					<div className="col-md-12">
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

						{this.state.images !== null && this.state.images.length !== 0
							&& <div className="row">
								{this.state.images.map((i) => i).map((i) => (
									<div
										key={i.id}
										className="col-md-2 col-sm-3">
										<Image
											id={i.id}
											thumbnail={i.thumbnail}
											height={i.height}
											width={i.width}
											creationDate={i.creation_date}
										/>
									</div>
								))}
							</div>
						}
					</div>
				</div>
			</div>
		);
	}
}
