import React from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';

class Calendar extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      month: null,
      selectedMonth: null,
      selectedYear: null,
      calendar: null,
      user: null,
      userCalendar: null,
      emptyDays: null,
      remainingEmptyDaysArray: null,
      dayKey: {
        "Sunday": 0,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6
      }
    }

    this.setData = this.setData.bind(this);
    this.hasBeenAdded = this.hasBeenAdded.bind(this);
    this.setUserCalendar = this.setUserCalendar.bind(this);
    this.getMonth = this.getMonth.bind(this);
    this.prevMonth = this.prevMonth.bind(this);
    this.nextMonth = this.nextMonth.bind(this);
  }

  getMonth(month, year) {
    let monthNum, yearNum;
    monthNum = month
    yearNum = year;

    if (monthNum && yearNum) {

      axios
      .get(`http://127.0.0.1:4000/getMonth?month=${monthNum}&year=${yearNum}`)
      .then(res => {
        const data = res.data;

        this.setState({
          month: data
        });
      })
      .catch((error) => {
        console.log(error);
      });
    } else {
      console.log('no date');
    }
  }

  prevMonth() {
    let newMonth, newYear;
    const currentMonth = this.state.selectedMonth;
    const currentYear = this.state.selectedYear;
    this.props.calPrevAction({currentMonth, currentYear});
  }

  nextMonth() {
    let newMonth, newYear;
    const currentMonth = this.state.selectedMonth;
    const currentYear = this.state.selectedYear;
    this.props.calNextAction({currentMonth, currentYear});
  }

  setData(props) {
    if (this.props.date) {
      this.setState({
        selectedMonth: this.props.date.currentMonth,
        selectedYear: this.props.date.currentYear
      });

      this.getMonth(this.props.date.currentMonth, this.props.date.currentYear);
    }

    this.setState({
      calendar: props.calendar,
      user: props.user
    }, () => {
      this.setUserCalendar();
    });
  }

  setUserCalendar() {
    const calId = this.state.calendar.id;

    for (const calendar of this.state.user.calendars) {
      if (calendar.id === calId) {
        this.setState({
          userCalendar: calendar
        });
      }
    }
  }

  hasBeenAdded(day) {
    if (!day) {
      return;
    }

    for (const date of this.state.calendar.dates) {
      if (day.date === date.date) {
        return date;
      }
    }
  }

  componentWillMount() {
    this.setData(this.props);
  }

  componentWillReceiveProps(newProps) {

    this.setState({
      selectedMonth: newProps.date.currentMonth,
      selectedYear: newProps.date.currentYear
    });
    this.getMonth(newProps.date.currentMonth, newProps.date.currentYear);
  }

  render() {

    if (this.state.month !== null && this.state.calendar !== null && this.state.userCalendar !== null) {
      const calendar = this.state.calendar;
      const month = this.state.month;
      const emptyDays = this.state.emptyDays;
      const remainingEmptyDays = this.state.remainingEmptyDays;
      const totalMembers = this.state.calendar.totalMembers;

      return (
        <section className="calendar" aria-label="calendar">
          <header className="calendar__header">
            <h2 className="calendar__title">{calendar.title}</h2>
          </header>
          <div className="calendar__body">
            <div className="calendar__actions">
              <button className="btn--unstyled month__btn-prev" onClick={this.prevMonth}>
                PREV
              </button>
              <button className="btn--unstyled month__btn-next" onClick={this.nextMonth}>
                NEXT
              </button>
            </div>

            <article className="month" aria-label="month">
              <header className="month__header">
                <h3 className="month__title">{month.title}</h3>
              </header>
              <div className="month__body" role="grid">
                <div className="days-heading" role="row">
                  <abbr className="day-header" title="Sunday" role="columnheader">Sun</abbr>
                  <abbr className="day-header" title="Monday" role="columnheader">Mon</abbr>
                  <abbr className="day-header" title="Tuesday" role="columnheader">Tue</abbr>
                  <abbr className="day-header" title="Wednesday" role="columnheader">Wed</abbr>
                  <abbr className="day-header" title="Thursday" role="columnheader">Thu</abbr>
                  <abbr className="day-header" title="Friday" role="columnheader">Fri</abbr>
                  <abbr className="day-header" title="Saturday" role="columnheader">Sat</abbr>
                </div>
                <div className="dates" role="row">
                {
                  month.dates.map((item, index) => {
                    const isEmpty = item.emptyDay || false;

                    const matchedDate = isEmpty ? false : this.hasBeenAdded(item) || false;
                    const date = isEmpty ? null : item.date;
                    let allAddedClass = '';
                    let atLeaseOneClass = '';
                    let numberAdded = null;
                    const userHasAdded = isEmpty ? false : this.state.userCalendar.datesSelected.includes(item.date);

                    if (matchedDate) {
                      allAddedClass = matchedDate.numberSelected === totalMembers ? ' day--all-added ' : '';
                      atLeaseOneClass = ' day--added ';
                      numberAdded = matchedDate.numberSelected;
                    }

                    return(
                      <div data-cal-date={date} key={index} className={"day " + allAddedClass + atLeaseOneClass} role="gridcell">
                      {
                        isEmpty ?
                          null
                        :
                          <div className="day__inner">
                            <span className="day__number">{item.dayOfMonth}</span>
                            {numberAdded ? <span className="day__amount-selected">{numberAdded}</span> : null}
                            <button className="btn--unstyled day__btn">
                            {
                              userHasAdded ?
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 10h24v4h-24z"/></svg>
                              : <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg>
                            }
                            </button>
                          </div>
                      }
                      </div>

                    )
                  })
                }
                </div>
              </div>
            </article>
          </div>
        </section>
      )
    } else {
      return null;
    }
  }
}

Calendar.propTypes = {
  calendar: React.PropTypes.object.isRequired,
  user: React.PropTypes.object.isRequired,
  calNextAction: React.PropTypes.func.isRequired,
  calPrevAction: React.PropTypes.func.isRequired,
  date: React.PropTypes.object,
};

export default Calendar;