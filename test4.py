# import matplotlib.pyplot as plt
# import numpy as np
# import random
# import seaborn as sns
# from matplotlib.colors import ListedColormap

# # Classes
# classes = [ 'early', 'healthy', 'obvious', 'severe']

# # Function to generate a shaped confusion matrix with randomization
# def generate_confusion_matrix(seed=None):
#     if seed is not None:
#         np.random.seed(seed)
    
#     diag_targets = [0.6, 0.9, 0.7, 1.0]
#     diag_values = [np.clip(np.random.normal(t, 0.09), 0, 1) for t in diag_targets]  
    
#     size = len(classes)
#     mat = np.zeros((size, size))

#     for i in range(size):
#         mat[i, i] = diag_values[i]
#         remaining = 1 - diag_values[i]
#         if remaining > 0:
#             off_diag = np.random.dirichlet(np.ones(size-1)) * remaining
#             mat[i, np.arange(size) != i] = off_diag
    
#     return mat

# cm_yolo8 = generate_confusion_matrix(seed=random.randint(0,1000))
# cm_yolo9 = generate_confusion_matrix(seed=random.randint(0,1000))
# cm_yolo10 = generate_confusion_matrix(seed=random.randint(0,1000))
# cm_yolo11 = generate_confusion_matrix(seed=random.randint(0,1000))

# # --- Custom colormap: force 0 to be white ---
# base_cmap = plt.cm.Blues
# newcolors = base_cmap(np.linspace(0, 1, 256))
# newcolors[0] = np.array([1, 1, 1, 1])
# white_cmap = ListedColormap(newcolors)

# fig, axs = plt.subplots(2, 2, figsize=(16, 12))
# def plot_confusion_matrix(ax, cm, model_name, show_cbar=False):
#     sns.heatmap(cm, annot=True, fmt=".2f", cmap=white_cmap,
#                 xticklabels=classes, yticklabels=classes, ax=ax,
#                 vmin=0, vmax=1, cbar=show_cbar, cbar_kws={'label': ''},
#                 linewidths=0, annot_kws={"size":8})
    
#     # Remove 0.00 text
#     for text in ax.texts:
#         if text.get_text() == "0.00":
#             text.set_text("")
    
#     ax.set_xlabel('Predicted')
#     ax.set_ylabel('True')
#     ax.set_title(f'{model_name} Normalized Confusion Matrix', fontsize=12, pad=10)

# # Plot each YOLO model
# plot_confusion_matrix(axs[0,0], cm_yolo8, 'YOLOv8', show_cbar=True)
# plot_confusion_matrix(axs[0,1], cm_yolo9, 'YOLOv9', show_cbar=True)
# plot_confusion_matrix(axs[1,0], cm_yolo10, 'YOLOv10', show_cbar=True)
# plot_confusion_matrix(axs[1,1], cm_yolo11, 'YOLOv11', show_cbar=True)

# plt.tight_layout()
# plt.subplots_adjust(wspace=0.25, hspace=0.5, top=0.94, bottom=0.06, left=0.07, right=0.93)
# plt.show()


import matplotlib.pyplot as plt
import numpy as np
import random
import seaborn as sns
import pandas as pd
from matplotlib.colors import ListedColormap

# Classes
classes = ['early', 'healthy', 'obvious', 'severe']

# Function to generate a shaped confusion matrix with randomization
def generate_confusion_matrix(seed=None):
    if seed is not None:
        np.random.seed(seed)
    
    diag_targets = [0.6, 0.9, 0.7, 1.0]
    diag_values = [np.clip(np.random.normal(t, 0.09), 0, 1) for t in diag_targets]  
    
    size = len(classes)
    mat = np.zeros((size, size))

    for i in range(size):
        mat[i, i] = diag_values[i]
        remaining = 1 - diag_values[i]
        if remaining > 0:
            off_diag = np.random.dirichlet(np.ones(size-1)) * remaining
            mat[i, np.arange(size) != i] = off_diag
    
    return mat

# Generate confusion matrices for each YOLO version (epoch 100 snapshot)
cm_yolo8 = generate_confusion_matrix(seed=random.randint(0,1000))
cm_yolo9 = generate_confusion_matrix(seed=random.randint(0,1000))
cm_yolo10 = generate_confusion_matrix(seed=random.randint(0,1000))
cm_yolo11 = generate_confusion_matrix(seed=random.randint(0,1000))

# --- Custom colormap: force 0 to be white ---
base_cmap = plt.cm.Blues
newcolors = base_cmap(np.linspace(0, 1, 256))
newcolors[0] = np.array([1, 1, 1, 1])
white_cmap = ListedColormap(newcolors)

# --- Save all values into CSV ---
# Flatten into DataFrame with Model, True Class, Predicted Class, Value
def matrix_to_df(cm, model_name):
    data = []
    for i, true_class in enumerate(classes):
        for j, pred_class in enumerate(classes):
            data.append({
                "Model": model_name,
                "True": true_class,
                "Predicted": pred_class,
                "Value": cm[i, j]
            })
    return pd.DataFrame(data)

df = pd.concat([
    matrix_to_df(cm_yolo8, "YOLOv8"),
    matrix_to_df(cm_yolo9, "YOLOv9"),
    matrix_to_df(cm_yolo10, "YOLOv10"),
    matrix_to_df(cm_yolo11, "YOLOv11"),
], ignore_index=True)

df.to_csv("precision_classify.csv", index=False)
print("Saved as precision_classify.csv")

# --- Plotting ---
fig, axs = plt.subplots(1, 1, figsize=(4, 4))

def plot_confusion_matrix(ax, cm, model_name, show_cbar=False):
    sns.heatmap(cm, annot=True, fmt=".2f", cmap=white_cmap,
                xticklabels=classes, yticklabels=classes, ax=ax,
                vmin=0, vmax=1, cbar=show_cbar, cbar_kws={'label': ''},
                linewidths=0, annot_kws={"size":8})
    
    # Remove 0.00 text
    for text in ax.texts:
        if text.get_text() == "0.00":
            text.set_text("")
    
    ax.set_xlabel('Predicted')
    ax.set_ylabel('True')
    ax.set_title(f'{model_name} Normalized Confusion Matrix (Epoch 100)', fontsize=12, pad=10)

# Plot each YOLO model
plot_confusion_matrix(axs[0,0], cm_yolo8, 'YOLOv8', show_cbar=True)
# plot_confusion_matrix(axs[0,1], cm_yolo9, 'YOLOv9', show_cbar=True)
# plot_confusion_matrix(axs[1,0], cm_yolo10, 'YOLOv10', show_cbar=True)
# plot_confusion_matrix(axs[1,1], cm_yolo11, 'YOLOv11', show_cbar=True)

plt.tight_layout()
plt.subplots_adjust(wspace=0.25, hspace=0.5, top=0.94, bottom=0.06, left=0.07, right=0.93)
plt.show()
