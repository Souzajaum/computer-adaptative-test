# app/irt.py
import numpy as np
from typing import List

def _sigmoid_stable(x: np.ndarray) -> np.ndarray:
    out = np.empty_like(x, dtype=float)
    pos = x >= 0
    neg = ~pos
    out[pos] = 1.0 / (1.0 + np.exp(-x[pos]))
    ex = np.exp(x[neg])
    out[neg] = ex / (1.0 + ex)
    return out

def p3pl(a: float, b: float, c: float, theta: np.ndarray) -> np.ndarray:
    return c + (1.0 - c) * _sigmoid_stable(a * (theta - b))

def eap_theta(
    items: np.ndarray,
    administered: List[int],
    responses: List[int],
    grid_min: float,
    grid_max: float,
    grid_size: int,
    prior_mean: float = 0.0,
    prior_sd: float = 1.0,
) -> float:
    grid = np.linspace(grid_min, grid_max, grid_size)
    prior = np.exp(-0.5 * ((grid - prior_mean) / prior_sd) ** 2)
    like = np.ones_like(grid)
    for idx, resp in zip(administered, responses):
        a, b, c, *_ = items[idx]
        P = p3pl(a, b, c, grid)
        like *= (P ** resp) * ((1 - P) ** (1 - resp))
    posterior = like * prior
    posterior /= max(posterior.sum(), 1e-12)
    theta_est = float((grid * posterior).sum())
    return theta_est
