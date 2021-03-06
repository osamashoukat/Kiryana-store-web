import React, { Component } from 'react';
// import Navbar from '../components/Navbar';
import Navbar2 from '../components/Navbar2';
import Footer from '../components/Footer';
import firebase from '../config/firebase';
import { connect } from 'react-redux';
import { orderNow } from '../config/firebase';
import Swal from 'sweetalert2'
// import InfiniteScroll from 'react-infinite-scroll-component';

import 'bootstrap/dist/css/bootstrap.css';
import '../App.scss'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class StoreDetails extends Component {
    constructor() {
        super()
        this.state = {
            tab1: "col-12 col-lg-4 col-md-4 text-center res-details-tab-active",
            tab2: "col-12 col-lg-4 col-md-4 text-center",
            tab3: "col-12 col-lg-4 col-md-4 text-center",
            tab1Content: true,
            tab2Content: false,
            tab3Content: false,
            cartItemsList: [],
            totalPrice: 0,
            totalActualPrice: 0,
            showCartList: false,
            defaultSearchValue: [],
            rendermenuItemsList: true,
            renderCategorizedRestaurants: false,
            renderSearchMenu: false,
        }
        this.handleSearchValueBar = this.handleSearchValueBar.bind(this);
    }

    async componentDidMount() {
        const { state } = await this.props.location
        this.fetchMenuItems()
        if (state) {
            this.setState({
                resDetails: state,
            })
        } else {
            this.props.history.push('/stores')
        }
    }

    static getDerivedStateFromProps(props) {
        const { state } = props.location;
        const { user } = props
        return {
            resDetails: state,
            userDetails: user,
        }
    }

    handleSearchValueBar(event) {
        const searchText = event;
        const { menuItemsList } = this.state;
        if (menuItemsList) {
            Object.keys(menuItemsList).map((val) => { });
            const result = menuItemsList.filter((val) => {
                return val.itemIngredients.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1 ||
                    val.itemTitle.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1;
            })
            // console.log(result)
            if (searchText.length > 0) {
                this.setState({
                    rendermenuItemsList: false,
                    renderCategorizedRestaurants: false,
                    renderSearchMenu: true,
                    searchRestaurants: result,
                    searchText: searchText,
                    defaultSearchValue: searchText,
                })
            } else {
                this.setState({
                    rendermenuItemsList: true,
                    renderCategorizedRestaurants: false,
                    renderSearchMenu: false,
                    searchRestaurants: result,
                    searchText: searchText,
                    defaultSearchValue: searchText,
                })
            }
        }
        else {
            return (
                <div style={{ marginLeft: "50%" }} className="spinner-border text-warning " role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            )
        }
    }

    handleTabs(e) {
        if (e === "tab1") {
            this.setState({
                tab1: "col-12 col-lg-4 col-md-4 text-center res-details-tab-active",
                tab2: "col-12 col-lg-4 col-md-4 text-center",
                tab3: "col-12 col-lg-4 col-md-4 text-center",
                tab1Content: true,
                tab2Content: false,
                tab3Content: false,
            })
        } else if (e === "tab2") {
            this.setState({
                tab1: "col-12 col-lg-4 col-md-4 text-center",
                tab2: "col-12 col-lg-4 col-md-4 text-center res-details-tab-active",
                tab3: "col-12 col-lg-4 col-md-4 text-center",
                tab1Content: false,
                tab2Content: true,
                tab3Content: false,
            })
        } else if (e === "tab3") {
            this.setState({
                tab1: "col-12 col-lg-4 col-md-4 text-center",
                tab2: "col-12 col-lg-4 col-md-4 text-center",
                tab3: "col-12 col-lg-4 col-md-4 text-center res-details-tab-active",
                tab1Content: false,
                tab2Content: false,
                tab3Content: true,
            })
        }
    }

    fetchMenuItems() {
        const { resDetails } = this.state;
        firebase.firestore().collection('users').doc(resDetails.id).collection("menuItems").onSnapshot(snapshot => {
            const menuItemsList = [];
            snapshot.forEach(doc => {
                const obj = { id: doc.id, ...doc.data() }
                menuItemsList.push(obj)
            })
            this.setState({
                menuItemsList: menuItemsList,
            })
        })
    }

    addToCart(item) {
        const { cartItemsList, totalPrice, totalActualPrice } = this.state
        if (item) {
            cartItemsList.push(item);
            this.setState({
                totalPrice: totalPrice + Number(item.itemSalePrice),
                totalActualPrice: totalActualPrice + Number(item.itemPrice),
                cartItemsList: cartItemsList,
                showCartList: true,
            })

        }
        // console.log(totalActualPrice, "    ",totalPrice)
    }


    removeCartItem(itemIndex) {
        const { cartItemsList, totalPrice, totalActualPrice } = this.state
        const removedItemPrice = Number(cartItemsList[itemIndex].itemSalePrice)
        const removedActualPrice = Number(cartItemsList[itemIndex].itemPrice)
        cartItemsList.splice(itemIndex, 1);
        this.setState({
            totalPrice: totalPrice - removedItemPrice,
            totalActualPrice: totalActualPrice - removedActualPrice,
            cartItemsList: cartItemsList,
        })
        // console.log(totalActualPrice)    

    }

    async handleConfirmOrderBtn() {
        const { cartItemsList, totalPrice, totalActualPrice, resDetails, userDetails } = this.state;
        console.log(cartItemsList.length)
        if (userDetails) {
            if (!userDetails.isRestaurant) {
                if (cartItemsList.length > 0) {
                    try {
                        const history = this.props.history;
                        const orderNowReturn = await orderNow(cartItemsList, totalPrice, totalActualPrice, resDetails, userDetails, history)
                        console.log(orderNowReturn)
                        // console.log("Successfully Ordered")
                        Swal.fire({
                            title: 'Success',
                            text: 'Successfully Ordered',
                            type: 'success',
                        }).then(() => {
                            history.push("/my-orders");
                        })
                    } catch (error) {
                        // console.log(" Error in confirm order => ", error)
                        Swal.fire({
                            title: 'Error',
                            text: error,
                            type: 'error',
                        })
                    }
                } else {
                    console.log("You have to select atleast one item")
                    Swal.fire({
                        title: 'Error',
                        text: 'You have to select atleast one item',
                        type: 'error',
                    })
                }
            } else {
                // console.log("You are not able to order")
                Swal.fire({
                    title: 'Error',
                    text: 'You are not able to order',
                    type: 'error',
                })
            }
        } else {
            // console.log("You must be Loged In")
            Swal.fire({
                title: 'Error',
                text: 'You must be Loged In',
                type: 'error',
            }).then(() => {
                this.props.history.push('/login')
            })
        }
    }

    _renderMenuItemsList() {
        const { menuItemsList } = this.state;
        if (menuItemsList) {
            let obj = [...menuItemsList]
            obj.sort((a, b) => a.itemSalePrice - b.itemSalePrice)
            return Object.keys(obj).map((val) => {
                return (
                    <div className="container border-bottom pb-2 px-lg-0 px-md-0 mb-4" key={obj[val].id}>
                        <div className="row">
                            <div className="col-lg-2 col-md-3 col-8 offset-2 offset-lg-0 offset-md-0 px-0 mb-3 text-center">
                                <img style={{ width: "70px", height: "70px" }} alt="item image" src={obj[val].itemImageUrl} />
                            </div>
                            <div className="col-lg-7 col-md-6 col-sm-12 px-0">
                                <h6 className="">{obj[val].itemTitle}</h6>
                                <p className=""><small>{obj[val].itemIngredients}</small></p>
                            </div>
                            <div className="col-lg-3 col-md-3 col-sm-12 px-0 text-center">
                                <span className="mx-3">RS.{obj[val].itemSalePrice}</span>
                                <span className="menuItemsListAddBtn" onClick={() => this.addToCart(obj[val])} ><FontAwesomeIcon icon="plus" className="text-warning" /></span>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        else {
            return (
                <div style={{ marginLeft: "50%" }} className="spinner-border text-warning " role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            )
        }
    }

    _renderSearchMenu() {
        const { searchRestaurants, menuItemsList } = this.state;
        if (searchRestaurants) {
            let obj = [...searchRestaurants]
            obj.sort((a, b) => a.itemSalePrice - b.itemSalePrice)
            return Object.keys(obj).map((val) => {
                return (
                    <div className="container border-bottom pb-2 px-lg-0 px-md-0 mb-4" key={obj[val].id}>
                        <div className="row">
                            <div className="col-lg-2 col-md-3 col-8 offset-2 offset-lg-0 offset-md-0 px-0 mb-3 text-center">
                                <img style={{ width: "70px", height: "70px" }} alt="item image" src={obj[val].itemImageUrl} />
                            </div>
                            <div className="col-lg-7 col-md-6 col-sm-12 px-0">
                                <h6 className="">{obj[val].itemTitle}</h6>
                                <p className=""><small>{obj[val].itemIngredients}</small></p>
                            </div>
                            <div className="col-lg-3 col-md-3 col-sm-12 px-0 text-center">
                                <span className="mx-3">RS.{obj[val].itemSalePrice}</span>
                                <span className="menuItemsListAddBtn" onClick={() => this.addToCart(obj[val])} ><FontAwesomeIcon icon="plus" className="text-warning" /></span>
                            </div>
                        </div>
                    </div>
                )
            })
        }
        else {
            return (
                <div style={{ marginLeft: "50%" }} className="spinner-border text-warning " role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            )
        }
    }

    _renderCartItemsList() {
        const { cartItemsList } = this.state
        if (cartItemsList) {
            return Object.keys(cartItemsList).map((val) => {
                return (
                    <li className="food-item border-bottom pb-2 mb-3" key={val}>
                        <div className="row">
                            <div className="col-8 pr-0">
                                <p className="mb-0">{cartItemsList[val].itemTitle}</p>
                            </div>
                            <div className="col-4 pl-0 text-right">
                                <p className="mb-0"><span className="food-price">RS.{cartItemsList[val].itemSalePrice}</span><span onClick={() => this.removeCartItem(val)} className="remove-food-item"><FontAwesomeIcon icon="times" /></span></p>
                            </div>
                        </div>
                    </li>
                )
            })
        }
        else {
            return (
                <div style={{ marginLeft: "50%" }} className="spinner-border text-warning " role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            )
        }
    }

    render() {
        const { tab1, tab2, tab3, tab1Content, tab2Content, tab3Content, resDetails, totalPrice, cartItemsList, showCartList, defaultSearchValue, renderSearchMenu, rendermenuItemsList } = this.state;
        return (
            <div>
                <div className="container-fluid res-details-cont1">
                    <div className="">
                        {/* <Navbar history={this.props.history} /> */}
                        <Navbar2 history={this.props.history} />
                        <div className="container px-0 res-details-cont1-text mx-0">
                            <div className="container">
                                <div className="row">
                                    <div className="col-lg-2 col-md-3 col-6 text-lg-center text-md-center pr-0 mb-2">
                                        <img className="p-2 bg-white rounded text-center" alt="Natural Healthy Food" style={{ width: "60%" }} src={resDetails.userProfileImageUrl} />
                                    </div>
                                    <div className="col-lg-10 col-md-9 col-12 pl-lg-0 pl-md-0">
                                        <h1 className="restaurant-title">{resDetails.userName}</h1>
                                        {/* <p className="restaurant-text">{resDetails.typeOfFood.join(', ')}</p> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ background: "#EBEDF3" }} className="container-fluid py-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-2 col-md-2 col-sm-12">
                                <div className="listing-category">
                                    <div className="category-heading py-0 mb-1">
                                        <h6 className="m-0"><FontAwesomeIcon icon="utensils" className="mr-2" />Categories</h6>
                                    </div>
                                    <br />
                                    <div>
                                        <ul className="category-list">
                                            <li>
                                                <p>Bread</p>
                                            </li>
                                            <li>
                                                <p>Chicken</p>
                                            </li>
                                            <li>
                                                <p>Buns</p>
                                            </li>
                                            <li>
                                                <p>Biscuits</p>
                                            </li>
                                            <li>
                                                <p>Sauces</p>
                                            </li>
                                            <li>
                                                <p>Vegatables</p>
                                            </li>
                                            <li>
                                                <p>Eggs</p>
                                            </li>
                                            <li>
                                                <p>Spices</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-7 col-md-7 col-sm-12">
                                <div className="container">
                                    <div className="row">
                                        <div className={tab1} onClick={() => this.handleTabs("tab1")}>
                                            <p className="res-details-tab-text"><FontAwesomeIcon icon="concierge-bell" className="mr-3" />Menu</p>
                                        </div>
                                        <div className={tab2} onClick={() => this.handleTabs("tab2")}>
                                            <p className="res-details-tab-text"><FontAwesomeIcon icon="comment-alt" className="mr-3" />Reviews</p>
                                        </div>
                                        <div className={tab3} onClick={() => this.handleTabs("tab3")}>
                                            <p className="res-details-tab-text"><FontAwesomeIcon icon="info-circle" className="mr-3" />Store Info</p>
                                        </div>
                                    </div>
                                    {tab1Content &&
                                        < div className="row menu-section">
                                            <div className="col-12 bg-white p-4">
                                                <div className="input-group input-group-sm mb-4 mt-2">
                                                    <input type="text" className="form-control search-menu-input" value={defaultSearchValue} onChange={(e) => this.handleSearchValueBar(e.target.value)} htmlFor="search-menu" placeholder="Search item" />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text search-menu-text" id="search-menu"><FontAwesomeIcon icon="search" /></span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="mb-4 text-warning">Best items:</h6>
                                                    {rendermenuItemsList && this._renderMenuItemsList()}
                                                    {renderSearchMenu && this._renderSearchMenu()}
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {tab2Content && <div className="row review-section">
                                        <div className="col-12 bg-white p-4">
                                            <h5>Customer Reviews For {resDetails.userName}</h5>
                                            <div className="row p-5">
                                                <div className="col-6 text-right">
                                                    <img alt="Review Icon" src={require("../assets/images/icon-review.png")} />
                                                </div>
                                                <div className="col-6 pl-0">
                                                    <p className="mb-0"><strong>Write your own reviews</strong></p>
                                                    <small className="text-danger">Only customers can write reviews</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    }
                                    {tab3Content && <div className="row info-section">
                                        <div className="col-12 bg-white p-4">
                                            <h5>Overview {resDetails.userName}</h5>
                                            <p>Base prepared fresh daily. Extra items are available in choose extra
                                                Choose you sauce: Go for on your Bread base for no extra cost.
                                                Choose fingers or Un cut on any size Bread</p>
                                        </div>
                                    </div>
                                    }
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-3 col-sm-12">
                                <div className="container bg-white py-3 my-3 text-center order-card">
                                    <div className="col-12">
                                        <button className="btn btn-warning btn-sm btn-block text-uppercase mr-2 mr-1 px-3" onClick={() => { window.open(resDetails.userMapLink, "_blank") }}><b>Store Location</b></button>
                                    </div>
                                </div>
                                <div className="container bg-white py-3 order-card">
                                    <h6 className="border-bottom pb-2 mb-3"><FontAwesomeIcon icon="shopping-basket" className="mr-2" />Your Order</h6>
                                    {cartItemsList.length > 0 ? <div>
                                        <div>
                                            <ul>
                                                {this._renderCartItemsList()}
                                            </ul>
                                        </div>
                                        <div>
                                            <div className="row ">
                                                <div className="col-12">
                                                    <p style={{ backgroundColor: '#f1f3f8', padding: '10px 15px' }}>Total+ <span style={{ float: 'right', color: '#2f313a', fontSize: '14px', fontWeight: 700 }}><em>RS.{totalPrice}</em></span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div> : <p className="text-success">There are no items in your basket.</p>}
                                    <div>
                                        <div className="row ">
                                            <div className="col-12">
                                                <button onClick={() => this.handleConfirmOrderBtn()} type="button" className="btn btn-warning btn-sm btn-block text-uppercase mr-2 mr-1 px-3"><b>Confirm Order</b></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div >
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.user,
    }
}

export default connect(mapStateToProps, null)(StoreDetails);