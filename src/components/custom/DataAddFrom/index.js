import React, { Component } from 'react';
import db from 'db';

class DataAddForm extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    const item = {
      name: this.dish.value,
      orders: parseInt(this.orders.value),
    };

    db.collection('dishes')
      .add(item)
      .then(res => {
        this.dish.value = '';
        this.orders.value = '';
      });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Dish Name:
            <input
              className="form-control"
              type="text"
              ref={input => (this.dish = input)}
              required
            />
          </label>
          <label>
            No. of Orders:
            <input
              className="form-control"
              type="number"
              ref={input => (this.orders = input)}
              required
              // min="20"
              // max="300"
            />
          </label>
          <input
            className="btn btn-warning btn-md mb-1"
            type="submit"
            value="Submit"
          />
        </form>
      </div>
    );
  }
}

export default DataAddForm;
