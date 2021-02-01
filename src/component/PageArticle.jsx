import React from 'react';
import './PageArticle.css';
import Loading from './box/Loading';
import Lock from './box/Lock';
import Table from './table/Table';
import {NotificationManager as nm} from 'react-notifications';
import {getRequest, postRequest, getBlobRequest} from '../utils/request';
import Article from './item/Article';
import Website from './item/Website';
import FormLine from './button/FormLine';
import {dictToURI} from '../utils/url';
import {getApiURL} from '../utils/env';
import DialogArticleFilter from './dialog/DialogArticleFilter';


export default class PageArticle extends React.Component {

	constructor(props) {
		super(props);

		this.refresh = this.refresh.bind(this);
		this.addArticle = this.addArticle.bind(this);

		this.state = {
			articles: null,
			newArticleTitle: null,
			filters: null,
		}
	}

	componentDidMount() {
		this.refresh();
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevState.filters !== this.state.filters)
			this.refresh();
	}

	refresh() {
		this.setState({
			articles: null,
			loading: true
		});

		let params = dictToURI(this.state.filters);

		getRequest.call(this, "article/get_articles?" + params, data => {
            this.setState({
                articles: data,
                loading: false
            });
        }, response => {
        	this.setState({ loading: false });
            nm.warning(response.statusText);
        }, error => {
        	this.setState({ loading: false });
            nm.error(error.message);
        });
	}

    addArticle() {
    	let params = {
    		title: this.state.newArticleTitle
    	}

    	postRequest.call(this, "article/add_article", params, response => {
            this.refresh()
            this.setState({ newArticleTitle: null });
            nm.info("The article has been added");
        }, response => {
            nm.warning(response.statusText);
        }, error => {
            nm.error(error.message);
        });
    }

    changeState(field, value) {
        this.setState({[field]: value});
    }

	render() {
		let columns = [
	        {
	            Header: 'Title',
	            accessor: x => { return x },
	            Cell: ({ cell: { value } }) => (
		        	<Article
	                    id={value.id}
	                    name={value.title}
	                    afterDeletion={() => this.refresh()}
	                    onOpen={() => this.props.history.push('/articles/' + value.id)}
                        onClose={() => this.props.history.push('/articles')}
                        open={value.id.toString() === this.props.match.params.id}
	                />
		      	)
	        },
	        {
	            Header: 'TYPE',
	            accessor: 'type'
	        },
	        {
	            Header: 'Publication date',
	            accessor: 'publication_date'
	        },
	        {
	            Header: 'Status',
	            accessor: 'status'
	        },
	        {
	            Header: 'Media',
	            accessor: 'media'
	        },
	        {
	            Header: 'Preview',
	            accessor: x => { return x },
	            Cell: ({ cell: { value } }) => (
		        	<Website
	                    url={getApiURL() + "public/get_article_content/" + value.handle + "?format=html"}
	                    label="Preview"
	                />
		      	)
	        },
        ];

		return (
			<div id="PageNews" className="page max-sized-page">
				<div className={"row row-spaced"}>
					<div className="col-md-12">
						<h1>{this.state.articles !== null ? this.state.articles.length: 0} Article{this.state.articles !== null && this.state.articles.length > 1 ? "s": ""}</h1>
						<div className="top-right-buttons">
							<button
								onClick={() => this.refresh()}>
								<i className="fas fa-redo-alt"/>
							</button>
							<DialogArticleFilter
		                        trigger={
		                            <button
		                                className={"blue-background"}
		                                data-hover="Filter">
		                                <span><i className="fas fa-shapes"/></span>
		                            </button>
		                        }
		                        applyFilter={filters => this.changeState("filters", filters)}
		                    />
						</div>
					</div>
					<div className="col-md-12">
						{this.state.articles !== null ?
							<div className="fade-in">
								<Table
									columns={columns}
									data={this.state.articles
										.filter(a => this.props.match.params.id === undefined ||
											this.props.match.params.id === a.id.toString())}
									showBottomBar={true}
								/>
							</div>
							:
							<Loading
								height={500}
							/>
						}
					</div>
				</div>
				<div className={"row row-spaced"}>
					<div className="col-md-6">
						<h1>Add a new article</h1>
						<FormLine
                            label={"Article title"}
                            value={this.state.newArticleTitle}
                            onChange={v => this.changeState("newArticleTitle", v)}
                        />
                        <div className="right-buttons">
                        	<button
                        		onClick={() => this.addArticle()}
                        		disabled={this.state.newArticleTitle === null || this.state.newArticleTitle.length < 3}>
                        		<i className="fas fa-plus"/> Add a new article
                        	</button>
                        </div>
					</div>
				</div>
			</div>
		);
	}
}