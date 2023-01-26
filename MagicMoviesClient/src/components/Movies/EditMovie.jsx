import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Movies.module.css";
import { useDispatch, useSelector } from "react-redux";
import { popupIsOn } from "../../redux/actions/popupActions";

import axios from "axios";

export default function EditMovie() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userLogin } = useSelector((store) => store.worker);
  const { updateMovies } = useSelector((store) => store.worker.permissions);
  const { movieId } = useParams();

  const [values, setValues] = useState({
    name: "",
    premiered: "",
    image: "",
    genres: "",
    movieSubscribers: [],
    subscribers: [],
  });

  const handleChange = (e) => {
    setValues((oldValues) => ({
      ...oldValues,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/movies/${movieId}`,
        values
      );

      if (data.success) {
        dispatch(popupIsOn("Movie updated successfully."));
        navigate(-1);
      }
    } catch (error) {
      dispatch(popupIsOn("Something went wrong, Please try again later."));
    }
  };

  const cancelForm = () => {
    navigate(-1);
  };

  const getMovieData = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/movies/${movieId}`
      );

      const resp = await axios.get("http://localhost:5000/api/subscribers");

      let arrSubs = [];
      resp.data.forEach((element) => {
        element.movies.forEach((movie) => {
          if (movie.movieId.toString() === movieId.toString()) {
            arrSubs.push(element);
          }
        });
      });

      let newObjData = {
        name: data.name,
        premiered: data.premiered.substring(0, 10),
        genres: data.genres,
        image: data.image,
        movieSubscribers: arrSubs,
        subscribers: [],
      };

      setValues(newObjData);
    } catch (error) {
      dispatch(popupIsOn("Something went wrong, Please try again later."));
    }
  }, [movieId]);

  useEffect(() => {
    getMovieData();
  }, [getMovieData]);

  const checkLogin = useCallback(() => {
    if (!userLogin) {
      navigate("/");
    }
  }, [userLogin, navigate]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  const checkPermission = useCallback(() => {
    if (!updateMovies) {
      navigate(-1);
    }
  }, [updateMovies, navigate]);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return (
    <>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.formInputGroup}>
          <input
            type="text"
            placeholder="Name"
            id="name"
            className={styles["form-input"]}
            required
            minLength="3"
            value={values.name}
            onChange={handleChange}
          />
          <label htmlFor="name" className={styles["form-label"]}>
            Name
          </label>
        </div>
        <div className={styles.formInputGroup}>
          <input
            type="text"
            placeholder="Genres"
            id="genres"
            className={styles["form-input"]}
            required
            minLength="4"
            value={values.genres}
            onChange={handleChange}
          />
          <label htmlFor="genres" className={styles["form-label"]}>
            Genres
          </label>
        </div>
        <div className={styles.formInputGroup}>
          <input
            type="url"
            placeholder="Image Url"
            id="image"
            className={styles["form-input"]}
            required
            value={values.image}
            onChange={handleChange}
          />
          <label htmlFor="image" className={styles["form-label"]}>
            Image Url
          </label>
        </div>
        <div className={styles.formInputGroup}>
          <input
            type="date"
            placeholder="Premiered"
            id="premiered"
            className={styles["form-input"]}
            required
            value={values.premiered}
            onChange={handleChange}
          />
          <label htmlFor="premiered" className={styles["form-label"]}>
            Premiered
          </label>
        </div>
        <div className={styles.formBtnGroup}>
          <button type="submit">Update Movie</button>
          <button type="button" onClick={cancelForm}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}
