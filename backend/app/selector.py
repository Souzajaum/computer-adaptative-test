# app/selector.py
import numpy as np

class MaxInfoSelector:
    def __init__(self):
        self.items = None  # Nx5 array [a,b,c,upper,exposure]

    def set_item_bank(self, items: np.ndarray):
        self.items = items

    @staticmethod
    def item_information(a: float, b: float, c: float, theta: float) -> float:
        P = c + (1 - c) / (1 + np.exp(-a * (theta - b)))
        dP = a * (1 - c) * P * (1 - P)
        I = (dP ** 2) / (P * (1 - P) + 1e-12)
        return I

    def select(self, theta: float) -> int:
        if self.items is None:
            raise ValueError("Item bank não configurado. Use set_item_bank()")
        info_values = [self.item_information(a, b, c, theta) for a, b, c, *_ in self.items]
        return int(np.argmax(info_values))
